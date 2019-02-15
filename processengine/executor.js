var contextualEval = function(js, context)
{
	return (function() { return eval(js) }).call(context);
};

var executeSequence = async function(sequence, context)
{
	for(var task of sequence)
		switch(task.type)
		{
			case 'script':
				contextualEval(task.script, context);
				break;

			case 'webservice':
				var requestData = undefined;
				if(task.pre) requestData = contextualEval(task.pre, context);
				await new Promise(function(resolve, reject)
				{
					var responseHandler = function(data) { context.response = data; resolve() };
					$.ajax({ method: task.method, url: task.url, data: requestData, dataType: 'json', success: responseHandler, error: reject });
				});
				if(task.post) contextualEval(task.post, context);
				break;

			case 'parallel':
				var parallels = [];
				for(var branch of task.branches)
					parallels.push(executeSequence(branch, context));
				await Promise.all(parallels);
				break;

			case 'or': case 'xor':
				for(var condition in task.branches)
					if(condition != 'default' && contextualEval(condition, context))
					{
						await executeSequence(task.branches[condition], context);
						if(task.type == 'xor') break;
					}
				if(task.branches.default)
				{
					await task.branches.default;
					break;
				}
				else throw 'No condition met and no default branch available.';
				
			default:
				throw 'Unknown task type: ' + task.type;
		}
};