angular.module('processEngine', [ 'ivl.angular-codearea' ])

.directive('ngFileDrop', [ function() // @see https://stackoverflow.com/a/43413408/11102694
{
    function fileDropzoneLink($scope, element, attrs)
    {
        element.bind('dragover', processDragOverOrEnter);
        element.bind('dragenter', processDragOverOrEnter);
        element.bind('dragend', endDragOver);
        element.bind('dragleave', endDragOver);
        element.bind('drop', dropHandler);

        function dropHandler(angularEvent)
        {
            var event = angularEvent.originalEvent || angularEvent;
            var file = event.dataTransfer.files[0];
            event.preventDefault();
            $scope.$eval(attrs.ngFileDrop)(file);
        }
        
        function processDragOverOrEnter(angularEvent)
        {
            var event = angularEvent.originalEvent || angularEvent;
            if(event) event.preventDefault();
            event.dataTransfer.effectAllowed = 'copy';
            element.addClass('dragging');
            return false;
        }

        function endDragOver()
        {
            element.removeClass('dragging');
        }
    }
    
    return { restrict: 'A', link: fileDropzoneLink };
}])

.directive('ngStyleVars', [ '$parse', function($parse)
{
    return function($scope, element, attrs)
    {
        $scope.$watch(attrs.ngStyleVars, function(cssVars)
        {
            for(let key in cssVars)
                element[0].style.setProperty(key, cssVars[key]);
        });
    };
}])

.controller('bpmController', [ '$scope', function($scope)
{
	$scope.vars = {};
    $scope.logs = [];
	$scope.process = [];
    $scope.taskTemplates = {};
    $scope.dataStorage = {};
    
    $scope.processUploaded = function(file)
    {
        if(file.type !== 'application/json')
            return void alert('Process is not a valid JSON file!');
        
        var reader = new FileReader();
        reader.onload = function(e)
        {
            $scope.$apply(function()
            {
                $scope.process = JSON.parse(e.target.result);
            });
        };
        reader.readAsText(file);
    };
    
    $scope.dataStorage.saveBinary = function(key, blob)
    {
        return new Promise(function(resolve, reject)
        {
            var reader = new FileReader();
            reader.onload = function(e)
            {
                $scope.$apply(function()
                {
                    $scope.vars[key] = e.target.result;
                    resolve();
                });
            };
            reader.readAsDataURL(blob);
        });
    };
    
    $scope.dataStorage.download = function(key)
    {
        window.open($scope.vars[key]);
    };
    
    $scope.dataStorage.loadBinary = function(key) // @see https://gist.github.com/wuchengwei/b7e1820d39445f431aeaa9c786753d8e
    {
        var dataURL = $scope.vars[key];
        var arr = dataURL.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--) u8arr[n] = bstr.charCodeAt(n);
        return new Blob([ u8arr ], { type: mime });
    };
    
    $scope.copy = function(obj)
    {
        return JSON.parse(JSON.stringify(obj));
    };
    
	$scope.count = function(obj)
	{
		return typeof obj === 'object' ? Object.keys(obj).length : 0;
	};
    
    $scope.promptEditor = function(x)
    {
        let val = prompt('Edit:', x);
        return val ? val : x;
    };
    
    $scope.objKeyRename = function(oldKey, newKey, object) // @see https://stackoverflow.com/questions/4647817/javascript-object-rename-key
    {
        if(oldKey !== newKey)
        {
            Object.defineProperty(object, newKey, Object.getOwnPropertyDescriptor(object, oldKey));
            delete object[oldKey];
        }
    };
    
    $scope.addLog = function()
    {
        var msg = new Date().toLocaleString() + ':';
        for(var arg of [].slice.call(arguments))
            msg += ' ' + JSON.stringify(arg);
        $scope.logs.push(msg);
        setTimeout(function() { $scope.$apply() }, 1);
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
                console.log(x);
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
            
            const accessibleObjects = { console: { log: $scope.addLog }, storage: $scope.dataStorage, FormData: window.FormData };
			executeSequence($scope.process, $scope.vars, accessibleObjects).then(successHandler).catch(errorHandler);
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
    
    let createEmptyElement = function(type)
    {
        switch(type)
        {
            case 'script': default:
                return { type: type, name: 'new script task', script: '' };
            
            case 'webservice':
                return { type: type, name: 'new web service task', method: 'GET', url: 'https://example.com/', pre: '', post: '' };
            
            case 'parallel':
                return { type: type, branches: [ [], [] ] };
            
            case 'xor': case 'or':
                return { type: type, branches: { default: [] } };
            
            case 'loop':
                return { type: type, branch: [], end: 'true' };
        }
    };
    
    $scope.insertAbove = function(element, insert)
    {
        if(!insert) return $scope.showModal = { modal: 'new', element: element, callback: arguments.callee };
        else if(typeof insert === 'string') insert = createEmptyElement(insert);
        else insert = $scope.copy(insert);
        
        if(element.parentBranch && element.index)
            element.parentBranch.splice(element.index, 0, insert);

        else if(element.parentBranch && element.index == 0)
            element.parentBranch.unshift(insert);

        else if(element.task.branch)
            element.task.branch.push(insert);
            
        $scope.hideMenu();
        $scope.hideModal();
    };
    
    $scope.insertBelow = function(element, insert)
    {
        if(!insert) return $scope.showModal = { modal: 'new', element: element, callback: arguments.callee };
        else if(typeof insert === 'string') insert = createEmptyElement(insert);
        else insert = $scope.copy(insert);
        
        if(element.parentBranch && element.index)
            element.parentBranch.splice(element.index + 1, 0, insert);
        
        else if(element.parentBranch && element.index == 0)
            element.parentBranch.splice(1, 0, insert);
        
        else if(element.task.branch)
            element.task.branch.push(insert);
        
        $scope.hideMenu();
        $scope.hideModal();
    };
    
    $scope.addBranch = function(element)
    {
        if(element.task.type == 'parallel')
            element.task.branches.push([]);
        
        else element.task.branches['false'] = [];
        
        $scope.hideMenu();
    };
    
    $scope.taskEditor = function(element)
    {
        $scope.showModal = { modal: 'editor', task: element.task };
        $scope.hideMenu();
    };
    
    $scope.saveTask = function(element)
    {
        let templateName = prompt('Save as:', element.task.name || '');
        if(templateName) $scope.taskTemplates[templateName] = $scope.copy(element.task);
        
        $scope.hideMenu();
    };
    
    $scope.hideMenu = function()
    {
        $scope.showMenu = false;
        $('#menu').css({ display: 'none' });
    };
    
    $scope.hideModal = function()
    {
        $scope.showModal = false;
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