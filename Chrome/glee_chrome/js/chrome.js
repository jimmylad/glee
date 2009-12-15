Glee.openNewTab = function(){
	//sending request to background.html to create a new tab
	chrome.extension.sendRequest({value:"createTab",url:Glee.URL},function(response){
	});
}

Glee.isBookmark = function(text){
	//send request to search the bookmark tree for the bookmark whose title matches text
	chrome.extension.sendRequest({value:"getBookmarks",text:text},function(response){
		if(response.bookmarks.length != 0) 
		{
			Glee.bookmarks = response.bookmarks;
			Glee.bookmarks[Glee.bookmarks.length] = text;
			Glee.currentResultIndex = 0;
			Glee.setSubText(0,"bookmark");
		}
		else //google it
		{
			Glee.setSubText(text,"search");
		}
	});
}

Glee.getBookmarklet = function(text){
	//sending request to get the first matched bookmarklet
	chrome.extension.sendRequest({value:"getBookmarklet",text:text},function(response){
		//if a bookmarklet is returned, run it
		if(response.bookmarklet)
			Glee.setSubText(response.bookmarklet,"bookmarklet");
		else
			Glee.setSubText("Command not found","msg");
	});
}

Glee.sendRequest = function(url,method,callback){
	//send request to background.html to send an XMLHTTPRequest
	chrome.extension.sendRequest({value:"sendRequest",url:url,method:method},function(response){
		callback(response.data);
	});
}

Glee.setOptions = function(response){
	
	//gleeBox position
	if(response.position != null) 
	{
		if(response.position == 0) //top
			Glee.position = "top";
		else if(response.position == 2)	//bottom
			Glee.position = "bottom";
		else 
			Glee.position = "middle";
	}
	
	//gleeBox Size
	if(response.size != null)
	{
		if(response.size == 0)
			Glee.size = "small";
		else if(response.size == 1)
			Glee.size = "medium";
		else
			Glee.size = "large";
	}
	
	//Bookmark search
	if(response.bookmark_search && response.bookmark_search == 1)
		Glee.bookmarkSearchStatus = true; //enabled
	else
		Glee.bookmarkSearchStatus = false;
		
	//Scrolling animation
	if(response.animation && response.animation == 1)
		Glee.scrollingSpeed = 750; //enabled
	else
		Glee.scrollingSpeed = 0; //disabled
	
	//getting the restricted domains
	if(response.domains)
	{
		Glee.domainsToBlock.splice(0,Glee.domainsToBlock.length);
		for(var i=0;i<response.domains.length;i++)
			Glee.domainsToBlock[i] = response.domains[i];
	}
	
	//Theme
	//If a theme is already set, remove it
	if(Glee.ThemeOption)
	{
		Glee.searchBox.removeClass(Glee.ThemeOption);
		Glee.searchField.removeClass(Glee.ThemeOption);
	}
	if(response.theme)
	{
		Glee.ThemeOption = response.theme;
	}
	else
	{
		Glee.ThemeOption = "GleeThemeDefault";
	}

	//check if it is a disabled domain
	if(Glee.checkDomain() == 1 && response.status == 1)
		Glee.status = 1;
	else
		Glee.status = 0;

	Glee.initOptions();
}

Glee.getOptions = function(){
	//sending request to get the gleeBox options
	chrome.extension.sendRequest({value:"getOptions"},Glee.setOptions);
}

//adding a listener to respond to requests from background.html to update the status and options.html to update settings
chrome.extension.onRequest.addListener(
	function(request,sender,sendResponse){
		if(request.value == "initStatus")
			Glee.status = request.status;
		else if(request.value == "updateOptions")
			Glee.setOptions(request);
		sendResponse({});
});