angular.module('processEngine', [])

.controller('bpmController', [ '$scope', function($scope)
{
	$scope.vars = {};
	
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
									"script": "console.log('doing A2')"
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
	}
	
	$scope.runProcess = function()
	{
		if($scope.running)
		{
			alert('Process is already running!');
			return;
		}
		
		else if(confirm('Do you want to execute this process now?'))
		{
			$scope.running = true;
			
			var errorHandler = function(x)
			{
				console.log(x);
				alert('Error while executing process!');
				$scope.$apply(function() { $scope.running = false });
			};
			
			var successHandler = function()
			{
				$scope.$apply(function()
				{
					$scope.running = false;
				});
			};
			
			executeSequence($scope.process, $scope.vars).then(successHandler).catch(errorHandler);
		}
	};
	
	$scope.edit = function(task, parentBranch, index)
	{
		alert(task.type + ' is the ' + index + 'th element in ' + parentBranch);// TODO
	};
}]);