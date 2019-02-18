/** executes the given BPMN process providing the given script context and scope */
var executeSequence = async function(sequence, context, scope)
{
	for(let task of sequence)
    {
        if(scope && scope.console && scope.console.log)
            scope.console.log('Started ' + (task.name || task.type));
        
		switch(task.type)
		{
			case 'script':
				secureContextualEval(task.script, context, scope);
				break;

			case 'webservice':
				let requestData = undefined;
				if(task.pre) requestData = secureContextualEval(task.pre, context, scope);
				await new Promise(function(resolve, reject)
				{
					let responseHandler = function(data) { context.response = data; resolve() };
					$.ajax({ method: task.method, url: task.url, data: requestData, dataType: 'json', success: responseHandler, error: reject });
				});
				if(task.post) secureContextualEval(task.post, context, scope);
				break;

			case 'parallel':
				let parallels = [];
				for(let branch of task.branches)
					parallels.push(executeSequence(branch, context, scope));
				await Promise.all(parallels);
				break;

			case 'or': case 'xor':
				for(let condition in task.branches)
					if(condition != 'default' && secureContextualEval(condition, context, scope))
					{
						await executeSequence(task.branches[condition], context, scope);
						if(task.type == 'xor') break;
					}
				if(task.branches.default)
				{
					await task.branches.default;
					break;
				}
				else throw 'No condition met and no default branch available.';
				
            case 'loop':
                do { await executeSequence(task.branch, context, scope) } while(!secureContextualEval(task.end, context, scope));
                break;
                
			default:
				throw 'Unknown task type: ' + task.type;
		}
        
        if(scope && scope.console && scope.console.log)
            scope.console.log('Finished ' + (task.name || task.type));
    }
};

/** securly executes the given JavaScript code with the given context and global scope */
var secureContextualEval = function(js, context, scope)
{
    new Function(js); // throws exception if code is not valid
    
    let globalScope = window, newGlobalScopeVarNames = [ 'arguments' ], newGlobalScopeVarValues = [ undefined ];
    
    if(scope) for(let key in scope) if(newGlobalScopeVarNames.indexOf(key) <= -1)
    {
        newGlobalScopeVarNames.push(key);
        newGlobalScopeVarValues.push(scope[key]);
    }
    
    for(let key in globalScope) if(newGlobalScopeVarNames.indexOf(key) <= -1) // overwrite all references to global scope to prevent XSS attacks
    {
        newGlobalScopeVarNames.push(key);
        newGlobalScopeVarValues.push(undefined);
    }
    
    let shield = 'const script = this.code; (function(' + newGlobalScopeVarNames.join(',') + ') { return eval(script) }).apply(this.context, this.scope)';
    return (function() { return eval(shield) }).call({ code: js, context: context, scope: newGlobalScopeVarValues });
};