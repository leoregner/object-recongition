angular.module('processEngine', [])

.controller('bpmController', [ '$scope', function($scope)
{
	$scope.vars = {};
    $scope.logs = [];
	
	$scope.process =
	[
		{
			"type": "script",
			"name": "A1",
			"script": "this.x = 4"
		},
		{
			"type": "parallel",
			"branches":
			[
				[
					{
						"type": "xor",
						"branches":
						{
							"default": [],
							"this.x < 5":
							[
								{
									"type": "script",
									"name": "A2",
									"script": "console.log('doing A2: x = ' + this.x)"
								}
							]
						}
					}
				],
				[
                    {
                        "type": "loop",
                        "end": "true",
                        "branch":
                        [
                            {
                                "type": "webservice",
                                "name": "A3",
                                "method": "GET",
                                "url": "",
                                "pre": "console.log('starting A3'); { greeting: 'hello' }",
                                "post": "console.log('done with A3')"
                            },
                            {
                                "type": "script",
                                "name": "A4",
                                "script": "console.log('doing A4')"
                            }
                        ]
                    }
				]
			]
		},
		{
			"type": "script",
			"name": "A5",
			"script": "console.log('doing A5')"
		}
	];
	
	$scope.count = function(obj)
	{
		return typeof obj === 'object' ? Object.keys(obj).length : 0;
	};
    
    $scope.addLog = function()
    {
        var msg = new Date().toLocaleString() + ':';
        for(var arg of [].slice.call(arguments))
            msg += ' ' + JSON.stringify(arg);
        $scope.logs.push(msg);
    };
	
	$scope.runProcess = function()
	{
		if($scope.running)
		{
			alert('Process is already running!');
			return;
		}
		
		else if(confirm('Do you want to execute this process now?'))
		{
			var errorHandler = function(x)
			{
				$scope.addLog('Error', x);
				alert('Error while executing process!');
				$scope.$apply(function() { $scope.running = false });
			};
			
			var successHandler = function()
			{
                $scope.addLog('Process execution finished');
				$scope.$apply(function() { $scope.running = false });
			};
			
            $scope.running = true;
            $scope.addLog('Process execution started');
			executeSequence($scope.process, $scope.vars, { console: { log: $scope.addLog } }).then(successHandler).catch(errorHandler);
		}
	};
	
	$scope.edit = function(task, parentBranch, index, $event)
	{
        if($scope.running)
            return;
        
        if(task && parentBranch && !index && !$event) // translation for function(branch, $event)
        {
            task = { type: 'sequence', branch: task };
            $event = parentBranch;
            parentBranch = undefined;
        }
        
        // show it menu set its position
        $scope.showMenu = { task: task, parentBranch: parentBranch, index: index };
        $('#menu').css({ display: 'block', left: ($event.clientX + window.scrollX) + 'px', top: ($event.clientY + window.scrollY) + 'px' });
        
        $event.stopPropagation();
	};
    
    $scope.deleteElement = function(element)
    {
        if(element.parentBranch && element.index)
            element.parentBranch.splice(element.index, 1);
        
        else if(element.parentBranch && element.index == 0)
            element.parentBranch.shift();
        
        $scope.hideMenu();
    };
    
    $scope.insertAbove = function(element, type)
    {
        var insert = { type: type || 'script', name: 'new task' };
        
        if(element.parentBranch && element.index)
            element.parentBranch.splice(element.index, 0, insert);
        
        else if(element.parentBranch && element.index == 0)
            element.parentBranch.unshift(insert);
        
        else if(element.task.branch)
            element.task.branch.push(insert);
        
        $scope.hideMenu();
    };
    
    $scope.insertBelow = function(element, type)
    {
        var insert = { type: type || 'script', name: 'new task' };
        
        if(element.parentBranch && element.index)
            element.parentBranch.splice(element.index + 1, 0, insert);
        
        else if(element.parentBranch && element.index == 0)
            element.parentBranch.splice(1, 0, insert);
        
        else if(element.task.branch)
            element.task.branch.push(insert);
        
        $scope.hideMenu();
    };
    
    $scope.addBranch = function(element)
    {
        // TODO
        
        $scope.hideMenu();
    };
    
    $scope.taskEditor = function(element)
    {
        // TODO
        
        $scope.hideMenu();
    };
    
    $scope.hideMenu = function()
    {
        $scope.showMenu = false;
        $('#menu').css({ display: 'none' });
    };
    
    $scope.addVar = function()
    {
        var key = prompt('Insert variable name:');
        if(key) $scope.vars[key] = '';
    };
    
    $scope.deleteVar = function(key)
    {
        delete $scope.vars[key];
    };
}]);