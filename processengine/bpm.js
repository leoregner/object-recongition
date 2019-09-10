/** executes the given BPMN process providing the given script context and scope */
var executeSequence = async function(sequence, context, scope)
{
	for(let task of sequence)
    {
        if(scope && scope.console && scope.console.log)
            scope.console.log('Started: ' + (task.name || task.type));

		switch(task.type)
		{
			case 'script':
				await secureContextualEval(task.script, context, scope);
				break;

			case 'webservice':
				let requestData = undefined, tempScope = { request: { data: null, expect: 'json' } };
                for(let k in scope) tempScope[k] = scope[k];
				if(task.pre) requestData = await secureContextualEval(task.pre, context, tempScope);
				await new Promise(function(resolve, reject)
				{
					let responseHandler = function(data) { tempScope.responseBody = data; resolve() };
                    let requestConfig = { method: task.method, url: task.url, success: responseHandler, error: reject, timeout: 0 };
                    requestConfig.data = tempScope.request.data;
                    requestConfig.dataType = tempScope.request.expect;
                    if(typeof tempScope.request.contentType !== 'undefined') requestConfig.contentType = tempScope.request.contentType;
                    if(tempScope.request.expect == 'binary' || tempScope.request.data) requestConfig.processData = false;
					$.ajax(requestConfig);
				});
				if(task.post) await secureContextualEval(task.post, context, tempScope);
				break;

			case 'parallel':
				let parallels = [];
				for(let branch of task.branches)
					parallels.push(executeSequence(branch, context, scope));
				await Promise.all(parallels);
				break;

			case 'or': case 'xor':
				for(let condition in task.branches)
					if(condition != 'default' && await secureContextualEval(condition, context, scope))
					{
						await executeSequence(task.branches[condition], context, scope);
						if(task.type == 'xor') break;
					}
				if(task.branches.default)
				{
					await executeSequence(task.branches.default, context, scope);
					break;
				}
				else throw 'No condition met and no default branch available.';

            case 'loop':
                do { await executeSequence(task.branch, context, scope) } while(!await secureContextualEval(task.end, context, scope));
                break;

			default:
				throw 'Unknown task type: ' + task.type;
		}

        if(scope && scope.console && scope.console.log)
            scope.console.log('Finished: ' + (task.name || task.type));
    }
};

/** securly executes the given JavaScript code with the given context and global scope */
var secureContextualEval = function(js, context, scope)
{
    new Function(js); // throws exception if code is not valid

	let sleepFunction = function(duration) { return new Promise(function(resolve, reject) { setTimeout(resolve, duration) }) };
    let globalScope = window, newGlobalScopeVarNames = [ 'arguments', 'sleep' ], newGlobalScopeVarValues = [ undefined, sleepFunction ];

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
    return Promise.resolve((function() { return eval(shield) }).call({ code: js, context: context, scope: newGlobalScopeVarValues }));
};
