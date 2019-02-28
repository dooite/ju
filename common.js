/**不弹窗上传文件。
*var autoSltFile = new AutoSelectFile();
*autoSltFile.frameName = "submit1";
*autoSltFile.uploadInfo = {filepath:"/thinkmanager/mib",loadtype:"mib", selectFileAfter:function};
*autoSltFile.init();

autoSltFile.selectFile()
*/
  
function AutoSelectFile()
{
	this.frameName = "";
	this.className = "";
	this.uploadInfo = null;
	this.fileName0 = "";
	this.waitImageStatus = "";
}
//var autoSltFile;
AutoSelectFile.start = function (frameName, up_info)
{
	if (typeof window.autoSltFile == "undefined")
	{
		window.autoSltFile = new AutoSelectFile();
	}
	autoSltFile.frameName = frameName;
	autoSltFile.uploadInfo = up_info;
	if (autoSltFile.init())
		autoSltFile.selectFile();
	return autoSltFile;
}

AutoSelectFile.prototype.init = function ()
{
	
	if (this.className == "")
	{
		this.className = "autoSltFile";
	}
	if (this.frameName == "")
	{
		alert("错误，不能实例化AutoSelectFile，没有隐含frame.");
		return false;
	}
	if (this.uploadInfo == undefined)
	{
		alert("错误，不能实例化AutoSelectFile.");
		return false;
	}
	
	if (this.uploadInfo.direct == undefined)
	{
		this.uploadInfo.direct = "";
	}
	if (this.uploadInfo.filepath == undefined)
	{
		this.uploadInfo.filepath = "";
	}
	if (this.uploadInfo.rename == undefined)
	{
		this.uploadInfo.rename = "";
	}
	if (this.uploadInfo.formname == undefined)
	{
		this.uploadInfo.formname = "";
	}
	if (this.uploadInfo.script == undefined)
	{
		this.uploadInfo.script = "";
	}
	else
	{
		this.uploadInfo.script = this.uploadInfo.script.replace(/\+/g, "%2b");
	}
	if (this.uploadInfo.referrer == undefined)
	{
		this.uploadInfo.referrer = "";
	}
	if (this.uploadInfo.ParentName != undefined)
	{
		this.uploadInfo.saveto = this.uploadInfo.ParentName;
	}
	if (this.uploadInfo.saveto == undefined)
	{
		this.uploadInfo.saveto = "";
	}
	if (this.uploadInfo.loadtype == undefined)
	{
		if (this.uploadInfo.saveto == "")
		{
			alert("错误，不能实例化AutoSelectFile,没有文件类型.");
			return false;
		}
		else
			this.uploadInfo.loadtype = "";
	}
	if (this.uploadInfo.plusStr == undefined)
	{
		this.uploadInfo.plusStr = "";
	}
	if (this.uploadInfo.instanceName == undefined)
	{
		this.uploadInfo.instanceName = "autoSltFile";		//实例名称，上传后要为fileName0赋值
	}
	if (this.uploadInfo.isMore == undefined)
	{
		this.uploadInfo.isMore = "";		//实例名称，上传后要为fileName0赋值
	}
	if (this.fileName0 == "" && this.uploadInfo.deleteFile != undefined)	//只在第一次接受页面传过来的参数
	{
		this.fileName0 = this.uploadInfo.deleteFile;		//实例名称，上传后要为fileName0赋值
	}
	if (this.uploadInfo.selectFileAfter == undefined)
	{
		this.uploadInfo.selectFileAfter = null;
	}
	if (this.uploadInfo.forward == undefined)
	{
		this.uploadInfo.forward = "";
	}
	return true;
}

AutoSelectFile.prototype.selectFile = function()
{
	var url = "";
	if (this.uploadInfo.saveto == "")
	{
		url = psubdir + "uploadform.jsp?direct=" + this.uploadInfo.direct + "&filepath=" + this.uploadInfo.filepath + 
			"&formname=" + this.uploadInfo.formname + "&loadtype=" + this.uploadInfo.loadtype +
			"&script=" + this.uploadInfo.script + "&rename=" + this.uploadInfo.rename +
			"&referrer=" + this.uploadInfo.referrer  + "&plusStr=" + this.uploadInfo.plusStr  
			+ "&instanceName=" + this.uploadInfo.instanceName+ "&isMore=" + this.uploadInfo.isMore + "&forward=" + this.uploadInfo.forward;
	}
	else
	{
		url = psubdir + "uploadform.jsp?direct=" + this.uploadInfo.direct + "&formname=" + this.uploadInfo.formname
			+ "&script=" + this.uploadInfo.script + "&saveto=" + this.uploadInfo.saveto  + "&plusStr=" + this.uploadInfo.plusStr  
			+ "&instanceName=" + this.uploadInfo.instanceName + "&isMore=" + this.uploadInfo.isMore
			+ "&loadtype=" + this.uploadInfo.loadtype + "&forward=" + this.uploadInfo.forward;
	}
	document.getElementsByName(this.frameName)[0].src = url;		//载入表单
	window.setTimeout(this.className + ".waitingSubmitFile()", 500);	//检查载入完成，出现载入框
}

AutoSelectFile.prototype.waitingSubmitFile = function()
{
	var upload;
	upload = document.getElementsByName(this.frameName)[0].contentWindow;
	if (this.waitImageStatus == "") {
		try {
				upload.document.getElementsByName("LocalName")[0].click();	//点击文件上传按钮，出现文件选择框
		} catch (e) {
			window.setTimeout(this.className + ".waitingSubmitFile()", 500);
			return;
		}
	}
	if (upload.document.getElementsByName("LocalName")[0].value == "")
	{
		return;
	}
	//已经选好文件了
	if (typeof this.uploadInfo.selectAfter == "function") {
		if (this.waitImageStatus == "") {	//第一次运行
			var result = this.uploadInfo.selectAfter.call(this, upload);
			if (typeof result == "boolean") {
				if (!this.uploadInfo.selectAfter.call(this, upload)) {
					return;
				}
			} else {
				return;
			}
		} else {
			if (this.waitImageStatus == "return") {
				this.waitImageStatus = "";
				if (this.handle != "") {
					clearTimeout(this.handle);
					this.handle = "";
				}
				return;
			}
		}
		
	}
	if (this.uploadInfo.isMore == "false" && !/^(0|)$/.test(this.fileName0))		//处理前一个附件
	{
		AjaxRequestPage(psubdir + "upload.jsp?option=DeleteFile&fileName0=" + this.fileName0, true, "", function(str){
		  str = unescape(str);
		  if (str == "ok" || str == "")
		  {
		    
		  }
		  else
		  {
		    alert(str);
		  }
		} );
	}
	if (this.uploadInfo.maxSize != undefined) {
		var thisObj = this;
		window.imgObj = new Image();
		imgObj.onload = function(){
			if (thisObj.checkLimitForImage(window.imgObj.fileSize, window.imgObj.width, window.imgObj.height)) {
				(function(){
					thisObj.continueUpload();
				})();
			}
			imgObj = null;
			thisObj = null;
		};
		imgObj.src = upload.document.getElementsByName("LocalName")[0].value;
		setTimeout("AutoSelectFile.checkOnload()", 1000);
	} else {
		this.continueUpload();
	}
	upload = null;
};
AutoSelectFile.checkOnload = function() {

	if (typeof img == "undefined" || img == null || img.readyState == "complete") {
		
	} else {
		alert("请将本站点加入安全站点,再进行上传.")
	}
}

AutoSelectFile.prototype.continueUpload = function(){
	var upload;
	try
	{
		upload = document.getElementsByName(this.frameName)[0].contentWindow;
	} catch(e) {}
	if (this.uploadInfo.selectFileAfter == null)
	{
		if (typeof this.uploadInfo.beforeUpload == "function") {
			this.uploadInfo.beforeUpload.call(this);
		}
		upload.xianshi();		//提交表单
	}
	else if (typeof this.uploadInfo.selectFileAfter == "function")
	{
		this.uploadInfo.selectFileAfter.call(this);
	}
	upload = null;

}

AutoSelectFile.prototype.checkLimitForImage = function(sizeOfImage, widthOfImage, heightOfImage) {
	var result = false;
	var isSize = false, isWidth = false, isHeight = false;
	var maxSizeOfImage = -1, maxWidthOfImage = -1, maxHeightOfImage = -1;
	if (this.uploadInfo.maxSize != undefined) {
		maxSizeOfImage = this.uploadInfo.maxSize;
	}
	if (this.uploadInfo.maxWidth != undefined) {
		maxWidthOfImage = this.uploadInfo.maxWidth;
	}
	if (this.uploadInfo.maxHeight != undefined) {
		maxHeightOfImage = this.uploadInfo.maxHeight;
	}
	if (maxSizeOfImage < 0 && maxWidthOfImage < 0 && maxHeightOfImage < 0) {
		result = true;
	} else if (maxSizeOfImage == 0 || maxWidthOfImage == 0 || maxHeightOfImage == 0) {
		alert("系统限制，不能上传图片。");
		result = false;
	} else {
		if (maxSizeOfImage > 0) {
			if (sizeOfImage <= maxSizeOfImage * 1024) {
				isSize = true;
			} else {
				alert("文件大小(" + (sizeOfImage+"").replace(/(\d{1,2})(\d{3})(?=(\d{3})*$)/g, "$1,$2")
					 + "B)超出限制" + maxSizeOfImage + "KB。");
				return false;
			}
		} else {
			isSize = true;
		}
		if (maxWidthOfImage > 0) {
			if (widthOfImage <= maxWidthOfImage) {
				isWidth = true;
			} else {
				alert("图像宽度(" + widthOfImage + "像素)超出限制" + maxWidthOfImage + "像素。");
				return false;
			}
		} else {
			isWidth = true;
		}
		if (maxHeightOfImage > 0) {
			if (heightOfImage <= maxHeightOfImage) {
				isHeight = true;
			} else {
				alert("图像高度(" + heightOfImage + "像素)超出限制" + maxHeightOfImage + "像素。");
				return false;
			}
		} else {
			isHeight = true;
		}
		result = isSize && isWidth && isHeight;
	}
	return result;
}

AutoSelectFile.prototype.uploadFile = function()
{
	var upload;
	try
	{
		upload = document.getElementsByName(this.frameName)[0].contentWindow;
	} catch(e) {}
	upload.xianshi();		//提交表单
	upload = null;
}


//多文档窗口类
function MDIWindows(oContainer, cfg)
{
	var mdibar, divbar, divdoc, morebutton;
	var self = this;
	
	this.Create = function(url, title, nNewDoc, windef)
	{
		if ((typeof(nNewDoc) == "undefined") || (nNewDoc != 1))
		{
			var bar = mdibar.getmenu();
			for (var x = 0; x < bar.length; x++)
			{
				var o = document.getElementById(bar[x].data);
				if ((o == url) || (o.src == url))
					return mdibar.run(x);
			}
		}

		if ((typeof(title) == "undefined") || (title == ""))
			title = "正在载入...";

		windef = FormatObjvalue({dblclick:ClosePage}, windef);
		var bar = mdibar.getmenu();
		var item = {item:title, className:"CommonPage", type:2, action:ClickPage, dblclick:windef.dblclick,zorder:bar.length + 1};

		var oPage;
		if (typeof url == "object")
			oPage = url;
		else
		{
			oPage = document.createElement("IFRAME");
			oPage.noResize = true;
			oPage.scrilling = "no";
			oPage.frameBorder = 0;
			oPage.src = url;
			oPage.attachEvent("onload", iframeok);
		}
		oPage.style.width = "100%";
		oPage.style.height = "100%";
		divdoc.firstChild.insertAdjacentElement("beforeEnd", oPage);
		item.data = oPage.uniqueID;
		mdibar.append(item);
		mdibar.run(item);
		SetPropPageScroll();
		return item;
	}

	function iframeok()
	{
		var id = event.srcElement.uniqueID;
		var bar = mdibar.getmenu();
		for (var x = 0; x < bar.length; x++)
		{
			if (bar[x].data == id)
			{
				if (bar[x].item == "正在载入...")
				{
					try {
						mdibar.setmenutext(x, event.srcElement.contentWindow.document.title);
					} catch (e) {}
				}
				self.pageready(bar[x]);
				break;
			}
		}
	}
	
	this.pageready = function(item)
	{
	};
	
	this.ShowBar = function(nShow)
	{
		if (nShow == 1)
		{
			divbar.style.display = "block";
			divdoc.style.margin = "";
			divdoc.style.padding = "";
		}
		else
		{
			divbar.style.display = "none";
			divdoc.style.margin = "0px";
			divdoc.style.padding = "0px";
		}
		
	};
	
	function ActPage(obj, item)
	{
		self.ActivePage(item.data);
	}

	this.ActivePage = function(item)
	{
		mdibar.run(item);
		SetPropPageScroll();
	};
	
	this.onactive = function(item)
	{
	};
	
	this.GetActivePage = function(nType)
	{
		var bardef = mdibar.getmenu();
		for (var x = 0; x < bardef.length; x++)
		{
			if (bardef[x].status == 1)
			{
				switch (nType)
				{
				case 1:			//名称
					return bardef[x].item;
				case 2:			//iframe object
					return document.getElementById(bardef[x].data);
				case 3:
					return bardef[x];
				default:
					return x;
				}
			}
		}
	};

	this.setPage = function (page, src)
	{
		var bardef = mdibar.getmenu();
		for (var x = 0; x < bardef.length; x++)
		{
			if ((bardef[x].item == page) || (x == page) || (bardef[x] == page))
			{
				document.getElementById(bardef[x].data).src = src;
				break;
			}	
		}
		
	};

	function ClickPage(obj, item)
	{
		var bar = mdibar.getmenu();
		var active;
		for (var x = 0; x < bar.length; x++)
		{
			var page = document.getElementById(bar[x].data);
			if (bar[x] == item)
			{
				page.style.display = "block";
				self.onactive(item);
				active = x;
			}
			else
			{
				page.style.display = "none";
			}
		}
		for (var x = 0; x < bar.length; x++)
		{
			if (bar[x].zorder > bar[active].zorder)
				bar[x].zorder --;
		}
		bar[active].zorder = bar.length;
	};

	function SetPropPageScroll()
	{
	var x, cnt = 0;
		var bar = mdibar.getmenu();
		if (bar.length == 0)
		{
			oContainer.firstChild.style.display = "none";
			return;
		}
		oContainer.firstChild.style.display = "block";

		if (oContainer.clientWidth == 0)
			return;
		if (bar.length * 71 < oContainer.clientWidth - 60)
		{
			if (morebutton != undefined)
			{
				morebutton.removeNode(true);
				for (var x = 0; x < bar.length; x++)
					mdibar.showItem(x, true);
				morebutton = undefined;
			}
			return;
		}
		if (morebutton == undefined)
		{
			mdibar.insertHTML("<span id=MoreButton style=font-family:webdings;padding-left:4px;>4</span>", "beforeEnd");
			morebutton = divbar.all.MoreButton;
			morebutton.onmousedown = ShowMorePage;
		}

		var nPos = self.GetActivePage(4);
		var pages = parseInt((oContainer.clientWidth - 60) / 71);
		for (x = nPos; x >= 0; x--)
		{
			if (cnt < pages)
			{
				cnt ++;
				mdibar.showItem(x, true);
			}
			else
				mdibar.showItem(x, false);
		}
		for (x = nPos + 1; x < bar.length; x++)
		{
			if (cnt < pages)
			{
				cnt ++;
				mdibar.showItem(x, true);
			}
			else
				mdibar.showItem(x, false);
		}
	};
	
	function ShowMorePage()
	{
		var bar = mdibar.getmenu();
		var nPos = self.GetActivePage(4);
		var menudef = [];
		for (var x = 0; x < bar.length; x++)
		{
			menudef[x] = {};
			if (mdibar.showItem(x) == true)
				menudef[x].style = "color:gray";
			if (x == nPos)
				menudef[x].img = "<span style='color:red;font:18px webdings'>a</span>";
			menudef[x].item = bar[x].item;
			menudef[x].data = x;
			menudef[x].action = ActPage;
		}
		menudef[bar.length] = {};
		menudef[bar.length + 1] = {item:"关闭全部窗口(总数:" + (bar.length - 1) + ")", 
			img: "<span style=color:red;font-family:webdings;>r</span>", action:self.closeAll};
		var menu = new CommonMenu(menudef);
		menu.show();
		return false;
	};
	
	this.closeAll = function()
	{
		if (window.confirm("是否关闭全部窗口？") == false)
			return;
		var bar = mdibar.getmenu();
		for (var x = bar.length - 1; x >= 0; x--)
			self.Close(bar[x]);
	};


	this.Close = function(item)
	{
		var menuitem = mdibar.getmenu(item);
		if (typeof menuitem != "object")
			return;
		var frm = document.getElementById(menuitem.data);
		try
		{
			if (frm.contentWindow.document.body.onbeforeunload != null)
			{
				if (window.confirm("该文档的内容已经改变，尚未保存，是否需要放弃退出？") == false)
					return;
			}
		}
		catch (e)
		{
		}
		frm.removeNode(true);
		var o = mdibar.remove(item);
		SetPropPageScroll();
		cfg.fnClose(mdibar, o[0]);
		var bar = mdibar.getmenu();
		for (var x = 0; x < bar.length; x++)
		{
			if (bar[x].zorder == bar.length)
				return mdibar.run(x);
		}
		mdibar.run(0);
	};	

	this.onClose = function(mdibar, obj)
	{
	};

	function ClosePage(obj, item)
	{
		if (typeof obj == "undefined")
			self.Close(self.GetActivePage(4));
		else
			self.Close(parseInt(obj.node));
	}

	function InitMDIWin()
	{
		cfg = FormatObjvalue({barClass:"MDIBar", winClass:"MDIWindow",fnClose:self.onClose, closeButton:0}, cfg);
		oContainer.innerHTML = "<div style='width:100%;height:100%;overflow:hidden;display:none'>" +
			"<div class=" + cfg.barClass + "></div><div class=" + cfg.winClass + "><div></div></div>";
		var button = "";
		if (cfg.closeButton == 1)
			button = "<span id=CloseWinButton style=font-family:webdings;>r</span>";
		mdibar = new CommonMenubar([], oContainer.firstChild.firstChild, {className:"CommPageContainer", title:button});
		divbar = oContainer.firstChild.firstChild;
		divdoc = oContainer.firstChild.lastChild;
		oContainer.onresize = SetPropPageScroll;
		if (cfg.closeButton == 1)
			divbar.all.CloseWinButton.onclick = ClosePage;
	}
	InitMDIWin();	
}


//分隔条类
//在两个DOM容器之间加上分隔条,以实现横向或纵向改变容器尺寸.当第二个容器obj2省略,则obj2为第一个容器的下一个对象.
function Split(obj1, obj2, fn, minedge, maxedge, nStyle)
{
	var obj, button, hv = 0, delta = 0;
	var self = this;
	if (typeof(obj2) != "object")
		obj2 = obj1.nextSibling;
	if (minedge == undefined)
		minedge = 0;
	if (maxedge == undefined)
		maxedge = 0;
	
/*
	obj1.attachEvent("onresize", function()
	{
		if (document.onmouseup == null)
		{
			var pos = GetObjPos(obj1);
			if (hv == 1)
				obj.style.left = pos.right + 3;
			else
				obj.style.top = pos.bottom + 3;
		}
		obj.style.display = obj2.style.display;
	});
*/	
	this.refresh = function ()
	{
		if (obj.style.display == "none")
			return;
		var pos = GetObjPos(obj1, obj.offsetParent);
		if (hv == 1)
		{
			obj.style.left = pos.right;
			obj.style.height = obj1.style.height;
			obj.style.top = pos.top;
		}
		else
		{
			obj.style.left = pos.left;
			obj.style.width = obj1.style.width;
			obj.style.top = pos.bottom;
		}
	};

	this.show = function (nShow)
	{
		switch (nShow)
		{
		case 0:
			obj.style.display = "none";
			break;
		case 1:
			obj.style.display = "block";
			break;
		}
	};
	
	this.onsplit = function (left, top)
	{
	};
	if (typeof fn == "function")
		this.onsplit = fn;
	Create();
	this.refresh();
	
	
	function Create()
	{
		var p1 = GetObjPos(obj1);
		var p2 = GetObjPos(obj2);
		if (p1.top == p2.top)
		{
			hv = 1;
			obj1.insertAdjacentHTML("afterEnd", 
				"<div style='position:absolute;height:24px;width:16px;font-family:webdings;font-size:16px;overflow:hidden;cursor:hand;filter:alpha(opacity=70);display:none;'>3</div>");
			button = obj1.nextSibling;
			obj1.insertAdjacentHTML("afterEnd", 
				"<div style='position:absolute;width:8px;overflow:hidden;cursor:col-resize;margin-left:-3px;filter:alpha(opacity=0);background-color:gray;'></div>");
			obj = obj1.nextSibling;
		}
		else if (p1.left == p2.left)
		{
			hv = 0;
			obj1.insertAdjacentHTML("afterEnd", 
				"<div style='position:absolute;height:16px;width:16px;font-family:webdings;font-size:16px;overflow:hidden;cursor:hand;filter:alpha(opacity=70);display:none;'>5</div>");
			button = obj1.nextSibling;
			obj1.insertAdjacentHTML("afterEnd", 
				"<div style='position:absolute;height:8px;overflow:hidden;cursor:row-resize;margin-top:-3px;filter:alpha(opacity=0);background-color:gray;'></div>");
			obj = obj1.nextSibling;
		}
	}

	obj.onmouseover = function ()
	{
		if (obj.onmousemove != null)
			return;
		var pos = GetObjPos(obj2, obj.offsetParent);
		if (hv == 1)
		{
			button.style.top = pos.top + parseInt((pos.bottom - pos.top) / 2) - 12;
			if (obj1.style.display != "none")
				button.style.left = pos.left - 9;
		}
		else
		{
			button.style.left = pos.left + parseInt((pos.right - pos.left) / 2) - 12;
			if (obj1.style.display != "none")
				button.style.top = pos.top - 15;
			else
				button.style.top = pos.top - 10;
		}
		if (nStyle == 1)
			button.style.display = "block";
	};

	button.onmouseout = function ()
	{
//		if (event.toElement != obj)
//			button.style.display = "none";
	};
	
	obj.onmouseout = function ()
	{
		if (event.toElement != button)
			button.style.display = "none";
	};
	
	button.onclick = function ()
	{
		if (hv == 1)
		{
			button.style.top = obj1.offsetTop + parseInt((obj2.offsetHeight - obj1.offsetTop) / 2) - 12;
			button.style.left = -4;
			if (obj1.style.display == "none")
			{
				obj1.style.display = "block";
				obj.style.pixelLeft = obj1.offsetWidth;
				button.innerText = 3;
				obj.style.cursor = "col-resize";
			}
			else
			{
				button.innerText = 4;
				obj1.style.display = "none";
				obj.style.cursor = "default";
				obj.style.pixelLeft = 0;
			}
		}
		else
		{
			if (obj1.style.display == "none")
			{
				obj1.style.display = "block";
				var pos = GetObjPos(obj2, obj.offsetParent);
				obj.style.pixelTop = pos.top;
				button.innerText = 5;
				obj.style.cursor = "row-resize";
			}
			else
			{
				button.innerText = 6;
				obj1.style.display = "none";
				obj.style.cursor = "default";
				var pos = GetObjPos(obj2, obj.offsetParent);
				obj.style.pixelTop = pos.top;
			}
			obj.onmouseover();
		}
		if (typeof(fn) == "function")
			fn(obj.style.pixelLeft, obj.style.pixelTop)
	}
	
	obj.onmousedown = function ()
	{
		if (obj2.style.display == "none")
			return;
		button.style.display = "none";
		if (obj1.style.display == "none")
			return button.onclick();
		obj.onmousemove = Splitting;
		obj.onmouseup = EndSplit;
		obj.ondragstart = Splitting;
		obj.style.filter = "alpha(opacity=60)";
		obj.setCapture();
		Splitting(1);
	};
	
	function Splitting(startflag)
	{
		var pos = GetObjPos(obj);
		var p1 = GetObjPos(obj1.parentNode);
		if (hv == 1)
		{
			if (startflag == 1)
				delta = pos.left - event.clientX;
			if (event.clientX - p1.left < minedge)
				obj.style.pixelLeft = p1.left + minedge - pos.left + obj.style.pixelLeft;
			else if (p1.right - event.clientX < maxedge)
				obj.style.pixelLeft = p1.right - maxedge - pos.left + obj.style.pixelLeft;
			else
				obj.style.pixelLeft = event.clientX - pos.left + delta + obj.style.pixelLeft;
		}
		else
		{
			if (startflag == 1)
				delta = pos.top - event.clientY;
			if (event.clientY - p1.top < minedge)
				obj.style.pixelTop = p1.top + minedge - pos.top + obj.style.pixelTop;
			else if (p1.bottom - event.clientY < maxedge)
				obj.style.pixelTop = p1.bottom - maxedge - pos.top + obj.style.pixelTop;
			else
				obj.style.pixelTop = event.clientY - pos.top + delta + obj.style.pixelTop;
		}
	}

	function EndSplit()
	{
		obj.style.filter = "alpha(opacity=0)";
		var pos = GetObjPos(obj1, obj.offsetParent);
		if (hv == 1)
			obj1.style.pixelWidth = obj.style.pixelLeft - pos.left;
		else
			obj1.style.pixelHeight = obj.style.pixelTop - pos.top;
		self.onsplit(obj.style.pixelLeft, obj.style.pixelTop);
		obj.onmousemove = null;
		obj.onmouseup = null;
		obj.ondragstart = null;
		document.releaseCapture();
		self.refresh();
		self.onsplit(obj.style.pixelLeft, obj.style.pixelTop);
	}
}

//文档内弹出框, 自动在矩形x1, y1, x2, y2的位置周围出现, 只要本身面积不大于文档,即不超出出文档边界.可用于弹出菜单等。
function PopupBox(tag, x1, y1, x2, y2)
{
var oDiv;
	this.show = function()
	{
		x1 = arguments[0];
		y1 = arguments[1];
		x2 = arguments[2];
		y2 = arguments[3];
		if (typeof x1 == "undefined")
		{
			x1 = event.clientX + document.body.scrollLeft;
			y1 = event.clientY + document.body.scrollTop;
		}
		if (typeof x2 == "undefined")
		{
			x2 = x1;
			y2 = y1;
		}
		this.unselect();

		oDiv.style.display = "block";
		var left = x2, top = y1;
		if (x1 == x2)
			top = y2;
		if ((y1 != y2) && (top + oDiv.clientHeight + 2 >= document.body.clientHeight + document.body.scrollTop))
		{
			top = y2 - oDiv.clientHeight;		//x1,x2,y1,y2如为矩形,则作为菜单条样式，根据空间位置，显示在菜单条周围
			if (x1 == x2)
				top = y1 - oDiv.clientHeight - 2;//x1,x2,y1,y2如为垂直竖线，则作为弹出框样式，根据空间位置，显示在下面或上面
		}
		if ((x1 != x2) && (x2 + oDiv.clientWidth >= document.body.clientWidth + document.body.scrollLeft))
			left = x1 - oDiv.clientWidth;	//对应于菜单显示，如右边空间不够，就放到左边
		if (top + oDiv.clientHeight > document.body.clientHeight + document.body.scrollTop)
			top = document.body.clientHeight - oDiv.clientHeight + document.body.scrollTop;
		if (left + oDiv.clientWidth > document.body.clientWidth + document.body.scrollLeft)
			left = document.body.clientWidth - oDiv.clientWidth + document.body.scrollLeft;
		
		if (top < 0)
			top = 0;	//如上或左也不够，就从上或左原点开始
		if (left < 0)
			left = 0;
		oDiv.style.left = left;
		oDiv.style.top = top;
	};

	this.isShow = function()
	{
		if (oDiv.style.display == "none")
			return false;
		return true;
	};
	
	this.hide = function()
	{
		oDiv.style.display = "none";
	};
	
	this.remove = function()
	{
		oDiv.removeNode(true);
		oDiv = undefined;
	};
	this.getdomobj = function()
	{
		return oDiv;
	};
	
	this.unselect = function()
	{
		for (var x = 0; x < oDiv.all.length; x++)
			oDiv.all[x].UNSELECTABLE = "on";
	};
	
	this.setSize = function(width, height)
	{
		if (typeof width == "number")
			oDiv.style.pixelWidth = width;
		if (typeof height == "number")
			oDiv.style.pixelHeight = height;
	};

	this.setPopObj = function (obj)
	{
		tag = obj;
		if (typeof tag == "string")
			oDiv.innerHTML = tag;
		if (typeof tag == "object")
			oDiv.insertAdjacentElement("afterBegin", tag);
		if (typeof x1 == "number")
			this.show(x1, y1, x2, y2);
	};
	
	oDiv = document.createElement("<DIV UNSELECTABLE=on style='display:none;position:absolute;background-color:white;z-index:99;overflow:visible;'></div>");
	document.body.insertBefore(oDiv);
	this.setPopObj(tag);
}

//文档内弹出窗口
function PopupWin(href, cfg)
{
	var self = this;
	var box, mask, sizebox;
	function init()
	{
		var htmlText = "";
		if (typeof href == "string")
		{
			if (href.substr(0, 1) != "<")
				htmlText = "<iframe name=IFrameDlg frameborder=0 style='width:100%;height:100%' src=" + href + "></iframe>";
			else
				htmlText = href;
		}
		var top = document.body.scrollTop;
		var left = document.body.scrollLeft;
		if (cfg.mask >= 0)
		{
			mask = document.createElement("<div style='position:absolute;left:" + left + "px;top:" + 
				top + "px;width:100%;height:100%;background-color:white;filter:alpha(opacity=" + cfg.mask + ");'></div>");
			document.body.insertAdjacentElement("beforeEnd", mask);
		}
		if (cfg.top < 0)
			cfg.top = top + (document.body.clientHeight - cfg.height) / 2;
		if (cfg.left < 0)
			cfg.left = left + (document.body.clientWidth - cfg.width) / 2;
		if (cfg.top < 0)
			cfg.top = 0;
		if (cfg.left < 0)
			cfg.left = 0;
		var tag = "<div id=InDlgBox style='position:static;width:" + cfg.width + "px;height:100%;' class=" + cfg.css + 
			"><div nowrap id=RTDiv><div id=LTDiv><div id=TDiv>" +
			"<div id=CloseButton onmouseover=this.className='ClsBox_Roll'; onmouseout=this.className='ClsBox'; class=ClsBox></div>" +
			"<b id=titlebar style=width:100%;overflow:hidden>" + cfg.title + "</b></div></div></div><div id=RDiv style=height:" +
			(cfg.height - 32) + "px;><div id=LDiv><div id=MDiv>" + htmlText +
			"</div></div></div><div id=RBDiv><div id=LBDiv><div id=BDiv></div></div></div></div>";

		box = new PopupBox(tag);
		box.unselect = function (){};
		box.show(cfg.left, cfg.top, cfg.left, cfg.top);

		var div = box.getdomobj();
		if ((cfg.title == "") && (typeof div.all.IFrameDlg == "object"))
			div.all.IFrameDlg.onload = frameOK;
		box.setSize(cfg.width, cfg.height);
		sizebox = new SizeBox(cfg.resize, "transparent");
		if ((cfg.bClose == 1) || (cfg.bClose == true))
			div.all.CloseButton.onclick = self.close;
		else
			div.all.CloseButton.style.display = "none";
		div.all.titlebar.onmousedown = sizebox.start;
		div.all.titlebar.ondblclick = sizebox.runMax;
		div.onresize = ResizeWin;
		sizebox.attach(div);
	}

	function ResizeWin()
	{
		var div = box.getdomobj();
		div.style.overflow = "hidden";
		div.all.RDiv.style.pixelHeight = div.style.pixelHeight - 32;
		div.style.overflow = "visible";
	}

	function frameOK()
	{
		var div = box.getdomobj();
		div.all.titlebar.innerText = div.all.IFrameDlg.contentWindow.document.title;
	}

	this.show = function (left, top, width, height)
	{
		if (typeof mask == "object")
			mask.style.display = "block";
		box.show(left, top, left, top);
		box.setSize(width, height);
		var div = box.getdomobj();
		sizebox.attach(div);
	}

	this.hide = function ()
	{
		if (typeof mask == "object")
			mask.style.display = "none";
		box.hide();
	};

	this.close = function ()
	{
		if (typeof mask == "object")
			mask.removeNode(true);
		box.remove();
		sizebox.remove();
	};

	cfg = FormatObjvalue({left:-1, top:-1, width:300, height:350, css:"InlineDlg", title:"", resize:1, mask:-1, bClose:1}, cfg);
	init();
}

//通用下拉菜单类
//用法:	var sysmenu = new CommonMenu([{item:"菜单项", img:"pic.gif", action:"alert()"},{item:""},{item:"子菜单,child:[...]}]);
//		sysmenu.show();
function CommonMenu(menudef, oParentMenu)
{
	var oMenuBox, oRoll;
	var oSubMenu;
	var oTimeout = null;
	var self = this;
	function InitMenu(x1, y1, x2, y2)
	{
		if (typeof(menudef) != "object")
			return;
		var tag = "", bLine = false;
		for (var x = 0; x < menudef.length; x++)
		{
			if (menudef[x].status == 1)
				continue;
				
			if ((menudef[x].item == "") || (typeof menudef[x].item == "undefined"))
			{
				if (bLine == true)
					tag += "<tr height=8px><td bgcolor=#e8edf0 colspan=3></td><td colspan=3 style='padding:4px 4px 0px 2px;'>" +
						"<div style='overflow:hidden;width:100%;height:3px;border-top:1px solid #e8edf0'></div></td><td></td></tr>";
				bLine = false;
			}				
			else
			{
				tag += "<tr height=24px node=" + x + "><td bgcolor=#e8edf0></td><td bgcolor=#e8edf0></td>";
				if ((typeof menudef[x].img == "string") && (menudef[x].img != ""))
				{
					if (menudef[x].img.substr(0, 1) == "<")
						tag += "<td bgcolor=#e8edf0 align=center>" + menudef[x].img + "</td>";
					else
						tag += "<td bgcolor=#e8edf0 align=center><img src=" + menudef[x].img + "></td>";
				}
				else
					tag += "<td bgcolor=#e8edf0></td>";
				var style = "";
				if (typeof menudef[x].style == "string")
					style = menudef[x].style;
				tag += "<td nowrap style=font-size:9pt;padding-left:10px;" + style + ">" + menudef[x].item + "</td>";
				if (typeof menudef[x].child == "object")
					tag += "<td align=right style='font:normal normal normal 14px webdings'>4</td>";
				else
					tag += "<td></td>";
				tag += "<td></td><td></td></tr>";
				bLine = true;
			}
		}
		tag = "<table cellpadding=0 cellspacing=0 border=0 style='filter:progid:DXImageTransform.Microsoft.Shadow(direction=135,strength=2,color=gray);background-color:white;border:1px solid gray;cursor:default;'>" +
			"<tr height=3px><td bgcolor=#e8edf0><div style=width:2px;height:3px;overflow:hidden;></div></td>" +
			"<td bgcolor=#e8edf0><div style=width:3px;height:3px;overflow:hidden;></div></td>" + 
			"<td bgcolor=#e8edf0><div style=width:30px;height:3px;overflow:hidden;></div></td><td></td>" +
			"<td><div style=width:32px;height:3px;overflow:hidden;></div></td>" +
			"<td><div style=width:3px;height:3px;overflow:hidden;></div></td>" +
			"<td><div style=width:2px;height:3px;overflow:hidden;></div></td></tr>" + tag +
			"<tr height=3px><td bgcolor=#e8edf0></td><td bgcolor=#e8edf0></td><td bgcolor=#e8edf0></td>" +
			"<td></td><td></td></tr></table>";
		oMenuBox = new PopupBox(tag);
		oMenuBox.show(x1, y1, x2, y2);
		var oMenuDiv = oMenuBox.getdomobj();
 		oMenuDiv.firstChild.onfocusout = CheckFocus;
 		oMenuDiv.onmousemove = RollMenu;
 		oMenuDiv.onmouseout = RollMenu;
 		oMenuDiv.onclick = ActionMenu;
		oMenuDiv.firstChild.focus();
	}

	function RollMenu()
	{
		var oMenuDiv = oMenuBox.getdomobj();
		var oTR = FindParentObject(event.srcElement, oMenuDiv, "TR");
		if (oTR == oRoll)
			return;
		if (typeof oRoll == "object")
		{
			oRoll.cells[1].className = "RMenuItem1";
			oRoll.cells[2].className = "RMenuItem1";
			oRoll.cells[3].className = "RMenuItem2";
			oRoll.cells[4].className = "RMenuItem2";
			oRoll.cells[5].className = "RMenuItem2";
			if (oTimeout != null)
			{
				window.clearTimeout(oTimeout);
				oTimeout = null;
			}
			if (typeof oSubMenu == "object")
				oSubMenu.hide();
			oSubMenu = 0;
			oMenuDiv.firstChild.focus();
		}
		oRoll = 0;	
		if ((typeof(oTR) == "object") && (oTR.height > 10))
		{
			oTR.cells[1].className = "RMenuSelItem1";
			oTR.cells[2].className = "RMenuSelItem2";
			oTR.cells[3].className = "RMenuSelItem2";
			oTR.cells[4].className = "RMenuSelItem2";
			oTR.cells[5].className = "RMenuSelItem3";
			if (oTR.cells[4].firstChild != null)
				oTimeout = window.setTimeout(ShowSubMenu, 500);
			oRoll = oTR;
		}	
	}

	function ShowSubMenu()
	{
		var index = oRoll.node;
		if (typeof menudef[index].child == "object")
		{
			var pos = GetObjPos(oRoll);
			if (typeof oMenuBox == "object")
			{
				oSubMenu = new CommonMenu(menudef[index].child, self);
				oSubMenu.show(pos.left, pos.top, pos.right, pos.bottom);
			}
		}
	}

	function ActionMenu()
	{
		if ((typeof oRoll == "object") && (typeof oSubMenu != "object"))
		{
			var index = oRoll.node;
			if (typeof menudef[index].child == "object")
			{
				if (oTimeout != null)
				{
					window.clearTimeout(oTimeout);
					oTimeout = null;
				}
				return ShowSubMenu();
			}
			self.hide(true);
			if (typeof menudef[index].action == "string")
				eval(menudef[index].action);
			if (typeof menudef[index].action == "function")
				return menudef[index].action(oRoll, menudef[index]);
		}
	}

	function CheckFocus()
	{
		if ((typeof oSubMenu == "object") && (oSubMenu.isShow() == true))
			return;
		self.hide(true);
	}
	
	this.show = function (x1, y1, x2, y2)
	{
		if (typeof oMenuBox == "object")
			return oMenuBox.show(x1, y1, x2, y2);
		InitMenu(x1, y1, x2, y2);
	};
	
	this.hide = function (flag)
	{
		if (typeof oMenuBox == "object")
		{
			if (typeof oSubMenu == "object")
				oSubMenu.hide();
			oMenuBox.remove();
			oMenuBox = 0;
		}
		if ((flag == true) && (typeof oParentMenu == "object"))
			oParentMenu.hide(true);
	};
	
	this.isShow = function ()
	{
		if (typeof oMenuBox == "object")
			return true;
		return false;
	};
	
	//过滤菜单项显示
	//例: filter = {	disable:1, str:"发送即时消息,发送内部邮件,查阅个人资料,查阅对话记录,查阅往来内部邮件,添加为我的好友"};
	//或: filter = {	disable:1, str:""};
	this.setMenuFilter = function(filter)
	{
		if (typeof filter != "object")
			return;
		var ss = filter.str.split(",");
//		var flag = 1, delflag;
		var status = 0 ,inistatus = 0;
		if (filter.disable == 1)
			status = 1;
		else
			inistatus = 1;
		for (var x = 0; x < menudef.length ; x++)
		{
			menudef[x].status = inistatus;
			for (var y = 0; y < ss.length; y++)
			{
				if (menudef[x].item == ss[y])
				{
					menudef[x].status = status;
					break;
				}
			}
		}
	};

	this.getmenu = function(item)
	{
		if (typeof item == "undefined")
			return menudef;
//		var obj = this.getDomItem(item);
//		if (typeof obj == "object")
//			return menudef[obj.node];
	};
}

//通用菜单条、工具栏、属性页标题类,菜单条创建在给定的容器内.容器内原有的内容被覆盖.
//用法:	var menubar = new CommonMenubar([{item:"菜单项", img:"pic.gif", action:"alert()"},{item:""},{item:"子菜单,child:[...]}], domobj);
//
function CommonMenubar(menudef, domObj, cfg)
{
	var oRoll;
	var nStatus = 0;
	var self = this;
	var childMenu;
	if (typeof domObj != "object")
		return;
	if (typeof cfg == "string")
		cfg = {title:cfg};
	cfg = FormatObjvalue({title:"", nMode:1, className:"CommonMenubar"}, cfg);
	
	function InitMenu()
	{
		var tag = "";
		for (var x = 0; x < menudef.length; x++)
			tag += getMenuItemHTML(menudef[x], x);
		domObj.innerHTML = "<table cellpadding=0 cellspacing=0 border=0 class=" + cfg.className +
			"><tr><td nowrap>" + tag + "</td><td nowrap id=titletd align=right>" + cfg.title +
			"</td></tr></table>";
 		var objs = domObj.getElementsByTagName("BUTTON");
 		domObj.onmousemove = RollMenu;
 		for (x = 0; x < objs.length; x++)
 		{
 			objs[x].onmouseover = RollMenu;
 			objs[x].onmouseout = OutMenu;
	 	}	
 		domObj.onclick = ActionMenu;
 		domObj.onmousedown = PushMenu;
 		domObj.ondblclick = DblClickMenu;
	}
	
	function getMenuItemHTML(item, node)
	{
		if (typeof item == "string")
			return item;
		if ( (item.item == undefined) && (item.img == undefined) && (item.action == undefined))
			return "&nbsp;";
		var tag = "<button UNSELECTABLE=on node=" + node;
		if ((item.disabled == true) || ((typeof item.action == "undefined") && (typeof item.child == "undefined")))
			tag += " disabled";
		if (typeof item.className == "string")
			tag += " class=" + item.className + "0";
		else
			tag += " class=CommonMenubarItem0";
		if (typeof item.style == "string")
			tag += " style=\"" + item.style + "\"";
		if ((typeof item.title == "string") && (item.title != ""))
			tag += " title=\"" + item.title + "\"";
		if ((typeof item.img == "string") && (item.img != ""))
			tag += "><img UNSELECTABLE=on align=texttop src=" + item.img;
		if ((typeof item.item == "string") && (item.item != ""))
				tag += ">" +  item.item + "</button>";
		else
			tag += "></button>";
		return tag;
	}
	
	function OutMenu(obj)
	{
		if ((nStatus == 1) && (typeof childMenu == "object"))
			return;
		self.hide();
	}
	
	function RollMenu()
	{
		var oSrc = FindParentObject(event.srcElement, domObj, "BUTTON");
		if (oRoll == oSrc)
			return;
		if (typeof oSrc != "object")
			return;
		if ((oSrc.tagName == "BUTTON") && (typeof oSrc.node != "undefined"))
		{
			if (oSrc.disabled)
				return;
			if (typeof oRoll == "object")
				self.hide();
			oRoll = oSrc;
			if (oRoll.node >= menudef.length)
				return;
			if ((menudef[oRoll.node].type == 2) && (menudef[oRoll.node].status == 1))
				return;
			if ((nStatus == 1) && (typeof menudef[oRoll.node].child == "object"))
				PushMenu();
			else
			{
				nStatus = 0;
				oRoll.className = oRoll.className.substr(0, oRoll.className.length - 1) + "1";
				if (typeof childMenu == "object")
				{
					childMenu.hide();
					childMenu = 0;
				}
			}
		}
	}
		
	function PushMenu()
	{
		if (typeof oRoll != "object")
			return;
		if ((oRoll.type == 2) && (oRoll.status == 1))
			return;
		nStatus = 1;
		oRoll.className = oRoll.className.substr(0, oRoll.className.length - 1) + "2";
		if (typeof childMenu == "object")
		{
			childMenu.hide();
			childMenu = 0;
			if (event.type == "mousedown")
				return;
		}
		if (oRoll.node >= menudef.length)
			return;
		if (typeof menudef[oRoll.node].child == "object")
		{
			var pos = GetObjPos(oRoll, childMenu);
			childMenu = new CommonMenu(menudef[oRoll.node].child, self);
			childMenu.show(pos.left, pos.bottom, pos.left, pos.bottom);	
		}
	}
		
	function ActionMenu()
	{
		if ((typeof oRoll == "object") && (typeof childMenu != "object")) 
		{
			var x = oRoll.node;
			oRoll.blur();
			if (oRoll.node >= menudef.length)
				return;
			switch (menudef[x].type)
			{
			case 1:
				if (menudef[x].status == 1)
					menudef[x].status = 0;
				else
					menudef[x].status = 1;
				break;
			case 2:
				for (var y = 0; y < menudef.length; y++)
				{
					if (x != y)
					{
						menudef[y].status = 0;
						SetDomItem(self.getDomItem(y));
					}
				}
				menudef[x].status = 1;
				break;
			}
			if (typeof menudef[x].action == "string")
				eval(menudef[x].action);
			if (typeof menudef[x].action == "function")
				menudef[x].action(oRoll, menudef[x]);
			self.hide(true);
			nStatus = 0;
		}
	}
	
	function DblClickMenu()
	{
		if ((typeof oRoll == "object") && (typeof childMenu != "object")) 
		{
			var x = oRoll.node;
			if (x >= menudef.length)
				return;
			if (typeof menudef[x].dblclick == "string")
				eval(menudef[x].dblclick);
			if (typeof menudef[x].dblclick == "function")
				menudef[x].dblclick(oRoll, menudef[x]);
		
		}
	}
	
	function SetDomItem(obj)
	{
		if (obj.node >= menudef.length)
			return;
		if (((menudef[obj.node].type == 1) || (menudef[obj.node].type == 2))
			&& (menudef[obj.node].status == 1))
			obj.className = oRoll.className.substr(0, obj.className.length - 1) + "2";
		else
			obj.className = obj.className.substr(0, obj.className.length - 1) + "0";	
	}
		
	this.run = function(item)
	{
		oRoll = this.getDomItem(item);
		if (typeof oRoll == "object")
			oRoll.click();
	};
	
	this.setStatus = function(item, status)
	{
		var obj = this.getDomItem(item);
		menudef[obj.node].status = status;
		SetDomItem(obj);
	}
	
	this.setDisabled = function (item, disabled)
	{
		var obj = this.getDomItem(item);
		obj.disabled = disabled;
	};
	
	this.getDomItem = function(item)
	{
		var oo = domObj.getElementsByTagName("BUTTON");
		for (var x = 0; x < oo.length; x++)
		{
			switch (typeof item)
			{
			case "number":
				if (oo[x].node == item)
					return oo[x];
				break;
			case "string":
				if ((oo[x].innerText == item) || (oo[x].title == item))
					return oo[x];
				break;
			case "object":
				if (menudef[oo[x].node] == item)
					return oo[x];
			}
		}
	};

	this.hide = function (flag)
	{
		if (flag == 1)
			nStatus = 0;
		if (typeof oRoll != "object")
			return;
		SetDomItem(oRoll);
		oRoll = 0;
		if ((typeof childMenu == "object") && (childMenu.isShow()))
			childMenu.hide();
	};
	
	this.append = function(obj)
	{
		
		var node = menudef.length;
		menudef[node] = obj;
		var tag = getMenuItemHTML(obj, node);
		var o = self.getDomItem(node - 1);
		if (o == null)
		{
			domObj.firstChild.cells[0].insertAdjacentHTML("afterBegin", tag);
			domObj.firstChild.lastChild.onmouseover = RollMenu;
 			domObj.firstChild.lastChild.onmouseout = OutMenu;		
		}
		else
		{
			o.insertAdjacentHTML("afterEnd", tag);
			o.nextSibling.onmouseover = RollMenu;
 			o.nextSibling.onmouseout = OutMenu;
		}
		return node;
	};

	this.remove = function(item)
	{
		var obj = this.getDomItem(item);
		for (var x = parseInt(obj.node) + 1; x < menudef.length; x ++)
		{
			var o = this.getDomItem(x);
			o.node = parseInt(o.node) - 1;
		}
		var o = menudef.splice(obj.node, 1);
		obj.removeNode(true);
		return o;
	};
	
	this.showItem = function(item, bshow)
	{
		var obj = this.getDomItem(item);
		if (typeof bshow == "undefined")
			return (obj.style.display == "none") ? false : true;
		if ((bshow == 0) || (bshow == false))
			obj.style.display = "none";
		else
			obj.style.display = "inline";
	};

	this.insertHTML = function(tag, sWhere)
	{
		domObj.firstChild.cells[0].insertAdjacentHTML(sWhere, tag);
	};

	this.getmenu = function(item)
	{
		if (typeof item == "undefined")
			return menudef;
		var obj = this.getDomItem(item);
		if (typeof obj == "object")
			return menudef[obj.node];
	};

	this.setmenutext = function(item, text)
	{
		var obj = this.getDomItem(item);
		menudef[obj.node].item = text;
		obj.innerHTML = text;
	};

	InitMenu();
}

//通用阴影对象
//
function CommonShadow(mode, param1, param2, oDoc)
{
var old, div;
	if (typeof oDoc == "undefined")
		oDoc = document.body;
	old = [];
	this.show = function(obj, bMulti)
	{
		if ((typeof obj != "object") || (obj == null))
			return this.hide();
		if ((old.length == 1) && (old[0].obj == obj))
			return;
		var len  = 0;
		switch (mode)
		{
		case 0:				//设置元素的背景色
			if ((bMulti != 1) && (bMulti != true))
				this.hide();
			len = old.length;
			old[len] = {};
			old[len].value = obj.style.backgroundColor
			obj.style.backgroundColor = param1;
			break;
		case 1:				//设置元素的CSS名称
			if ((bMulti != 1) && (bMulti != true))
				this.hide();
			len = old.length;
			old[len] = {};
			old[len].value = obj.className;
			obj.className = param1;
			break;
		case 2:				//创建一个被元素遮档的新元素,以实现光影
			if (typeof div != "object")
			{
				div = document.createElement("DIV");
				div.style.position = "absolute";
				div.style.backgroundColor = param1;
				div.style.filter = "progid:DXImageTransform.Microsoft.alpha(opacity=50) progid:DXImageTransform.Microsoft.Blur(pixelradius=" + 
					param2 + ")";
				oDoc.insertAdjacentElement("beforeEnd", div);
			}
			old[len] = {};
			div.style.zIndex = obj.style.zIndex - 1;
			var pos = GetObjPos(obj, oDoc);
			div.style.width = pos.right - pos.left;
			div.style.height = pos.bottom - pos.top;
			div.style.top = pos.top - param2;
			div.style.left = pos.left - param2;
			div.style.display = "block";
			break;
		case 3:				//创建一个被元素遮档的指定新元素
			if (typeof div != "object")
			{
				div = document.createElement("DIV");
				div.style.position = "absolute";
				div.innerHTML = param1;
				oDoc.insertAdjacentElement("beforeEnd", div);
			}
			old[len] = {};
			div.style.zIndex = obj.style.zIndex - 1;
			var pos = GetObjPos(obj, oDoc);
			div.style.width = pos.right - pos.left;
			div.style.height = pos.bottom - pos.top;
			div.style.top = pos.top;
			div.style.left = pos.left;
			div.style.display = "block";
		}
		old[len].obj = obj;
	};
		
	this.hide = function()
	{
		for (var x = 0; x < old.length; x++)
		{
			switch (mode)
			{
			case 0:
				old[x].obj.style.backgroundColor = old[x].value;
				break;
			case 1:
				old[x].obj.className = old[x].value;
				break;
			case 2:
			case 3:
				div.style.display = "none";
				break;
			}
		}
		old = [];
	};
	
	this.getObj = function()
	{
		if (old.length == 0)
			return;
		if (old.length == 1)
			return old[0].obj;
		return old;
	};
	
	this.getShadow = function ()
	{
		return old;
	}
	
	this.isShadow = function (obj)
	{
		for (var x = 0; x < old.length; x++)
		{
			if (obj == old[x].obj)
				return true;
		}
		return false;
	}
}

//自定义桌面对象
function Desktop(nMode, domObj)
{
var drag;
var self = this;
var root = document.body;
var css = "Widget";
	function getWidget(x, y)
	{
		switch (typeof x)
		{
		case "object":
			return x;
		case "undefined":
			return event.srcElement.parentNode.parentNode.parentNode.parentNode;
		case "string":
			return domObj.all[x];
		default:
			return domObj.childNodes[col].childNodes[row];
		}
	}

	function OverBtn()
	{
		event.srcElement.className = event.srcElement.className.substr(0, event.srcElement.className.length - 1) + "1";
	}

	function OutBtn()
	{
		event.srcElement.className = event.srcElement.className.substr(0, event.srcElement.className.length - 1) + "0";
	}

	function Option()
	{
		var oMenuItems = [];
//		if (typeof self.setupWidgetDlg == "function")
//			oMenuItems[0] = {item:"设置", action:self.setupWidgetDlg};
//		oMenuItems[oMenuItems.length] = {};
		oMenuItems[oMenuItems.length] = {item:"更改版式", action:LayerDlg};
		if (typeof self.appendWidgetDlg == "function")
			oMenuItems[oMenuItems.length] = {item:"添加内容", action:self.appendWidgetDlg};
				
		var oMenu = new CommonMenu(oMenuItems);
		oMenu.show();
	}
	
	function LayerDlg()
	{
		var text = "<div align=left style='padding:20px;'>" +
			"<span style=width:200px;><input name=layer type=radio value=3 style=vertical-align:top;margin-top:30px><table width=100px height=80 border=0 bgcolor=#ADD6F5 cellspacing=5 cellpadding=3 style=display:inline><td bgcolor=white></td><td bgcolor=white></td><td bgcolor=white></td></table></span>" +
			"<span style=width:120px><input name=layer type=radio value=2 style=vertical-align:top;margin-top:30px><table width=100px height=80 border=0 bgcolor=#ADD6F5 cellspacing=5 cellpadding=3 style=display:inline><td bgcolor=white></td><td bgcolor=white></td></table></span>" +
			"<br><br><span style=width:200px><input name=layer type=radio value=22 style=vertical-align:top;margin-top:30px><table width=100px height=80 border=0 bgcolor=#ADD6F5 cellspacing=5 cellpadding=3 style=display:inline><td width=33% bgcolor=white></td><td bgcolor=white></td></table></span>" +
			"<span style=width:120px><input name=layer type=radio value=12 style=vertical-align:top;margin-top:30px><table width=100px height=80 border=0 bgcolor=#ADD6F5 cellspacing=5 cellpadding=3 style=display:inline><td width=67% bgcolor=white></td><td bgcolor=white></td></table></span>" +
			"</div><hr size=1><div align=right style='margin-right:30px;'><input name=OKButton type=button value=确定 onclick=''>&nbsp;&nbsp;<input type=button value=取消 onclick=CloseInlineDlg()></div>"
		InlineHTMLDlg("更改自定义桌面版式", text, 380, 310);
		var oo = document.all.InDlgDiv.all.layer;
		for (var x = 0; x < oo.length; x++)
		{
			if (oo[x].value == nMode)
				oo[x].checked = true;
		}
		document.all.InDlgDiv.all.OKButton.onclick = setLayer;
	} 
	
	function setLayer(nLayer)
	{
		if (typeof nLayer == "undefined")
		{
			var oo = document.all.InDlgDiv.all.layer;
			for (var x = 0; x < oo.length; x++)
			{
				if (oo[x].checked)
					nLayer = parseInt(oo[x].value);
			}
		}
		changeLayer(nLayer);
		CloseInlineDlg();
		if (typeof self.desktopChange == "function")
			self.desktopChange("layerChange", null, nLayer);
	}
	
	this.minimize = function (x, y)
	{
	var widget, btn, body, evttype;
		widget = getWidget(x, y);
		btn = widget.firstChild.firstChild.lastChild.firstChild.nextSibling;
		body = widget.firstChild.lastChild;
		if (body.style.display == "none")
		{
			body.style.display = "block";
			btn.className = btn.className.replace("_Restore_", "_Minimize_");
			evttype = "restore";
		}
		else
		{
			body.style.display = "none";
			btn.className = btn.className.replace("_Minimize_", "_Restore_");
			evttype = "minimize";
		}
		if (typeof self.desktopChange == "function")
			self.desktopChange(evttype, widget);
	}
		
	this.close = function(x, y)
	{
		var o = getWidget(x, y);
		if (typeof self.desktopChange == "function")
			self.desktopChange("beforeClose", o);
		o.removeNode(true);
	}

	function Drag()
	{
		switch (event.srcElement.tagName)
		{
		case "DIV":
			drag = event.srcElement.parentNode.parentNode;
			break;
		case "H5":
			drag = event.srcElement.parentNode.parentNode.parentNode;
			break;
		default:
			return;
		}
		var pos = GetObjPos(drag);
		drag.style.border = "2px dashed gray";
		var status = self.getStatus(drag);
		var oDiv = document.createElement("div");
		oDiv.style.display = "block";
		oDiv.style.position = "absolute";
		oDiv.style.filter = "alpha(opacity=70)";
		oDiv.style.zIndex = 100;
		domObj.appendChild(oDiv);
		drag.style.height = pos.bottom - pos.top;
		oDiv.insertAdjacentElement("beforeEnd", drag.firstChild);
		oDiv.style.pixelLeft = pos.left;
		oDiv.style.pixelTop = pos.top;
		oDiv.style.width = pos.right - pos.left;
		var clickleft = event.screenX - pos.left;
		var clicktop = event.screenY - pos.top;
		var oTimer = null;
		var scrollHeight = root.scrollHeight + oDiv.clientHeight;
		function draging()
		{
			oDiv.style.pixelLeft = event.screenX - clickleft;
			oDiv.style.pixelTop = event.screenY - clicktop;
			if ((event.y + 10 > root.clientHeight) || (event.y < 10))
			{
				if ((oTimer == null) && ((root.scrollTop + root.clientHeight < scrollHeight) || (root.scrollTop > 0)))
				{
					var delta = 4;
					if (event.y < 10)
						delta = -4;
					oTimer = window.setInterval(function()
					{
						root.scrollTop += delta;
						oDiv.style.pixelTop += delta;
						clicktop -= delta;
						if ((root.scrollTop + root.clientHeight >= scrollHeight) || (root.scrollTop == 0))
						{
							window.clearInterval(oTimer);
							oTimer = null;
						}
					}, 40);
				}
			}
			else
			{
				if (oTimer != null)
				{
					window.clearInterval(oTimer);
					oTimer = null;
				}
			}
			event.returnValue = false;
			for (var y = 0; y < domObj.childNodes.length; y++)
			{
				pos = GetObjPos(domObj.childNodes[y]);
				if ((event.x >= pos.left) && (event.x < pos.right))
				{
					for (var x = 0; x < domObj.childNodes[y].childNodes.length; x++)
					{
						pos = GetObjPos(domObj.childNodes[y].childNodes[x]);
						if (event.y + root.scrollTop < pos.bottom - (pos.bottom - pos.top) / 2)
							return domObj.childNodes[y].childNodes[x].insertAdjacentElement("beforeBegin", drag);
					}
					return domObj.childNodes[y].insertAdjacentElement("beforeEnd", drag);
				}
			}
		}

		function dragend()
		{
			document.detachEvent("onmousemove", draging);
			document.detachEvent("onmouseup", dragend);
			if (oTimer != null)
			{
				window.clearInterval(oTimer);
				oTimer = null;
			}
			document.releaseCapture();
			drag.insertAdjacentElement("beforeEnd", oDiv.firstChild);
			drag.style.border = "none";
			drag.style.height = "auto";
			oDiv.removeNode(true);
			if (self.getStatus(drag) != status)
			{
				if (typeof self.desktopChange == "function")
					self.desktopChange("posChange", drag, status);
			}
			drag = 0;
			oDiv = 0;
		}
		document.attachEvent("onmousemove", draging);
		document.attachEvent("onmouseup", dragend);
		root.setCapture(true);	
	}

	this.createWidget = function(id, title, col, tag)
	{
		if (col >= domObj.childNodes.length)
			col = 0;
		var o = domObj.childNodes[col];
		
		o.insertAdjacentHTML("beforeEnd", "<div id=" + id + " style='width:100%;padding:2px 4px;'>" +
			"<div class=" + css + "_Box><div class=" + css + "_Titlebar><h5 style=float:left;>" + title +
			"</h5><div class=" + css + "_Toolbar><span class=" + css +
			"_Option_Button_0></span><span class=" + css + "_Minimize_Button_0></span>" +
			"<span class=" + css + "_Close_Button_0></span></div></div><div></div></div></div>");
		switch (typeof tag)
		{
		case "string":
			o.lastChild.firstChild.lastChild.insertAdjacentHTML("beforeEnd", tag);
			break;
		case "object":
			o.lastChild.firstChild.lastChild.insertAdjacentElement("beforeEnd", tag);
			break;
		}
		o = o.lastChild.firstChild.firstChild.lastChild;
		o.parentNode.onmousedown = Drag;
		o.firstChild.onmouseover = OverBtn;
		o.firstChild.onmouseout = OutBtn;
		o.firstChild.onclick = Option;

		o.firstChild.nextSibling.onmouseover = OverBtn;
		o.firstChild.nextSibling.onmouseout = OutBtn;
		o.firstChild.nextSibling.onclick = this.minimize;

		o.lastChild.onmouseover = OverBtn;
		o.lastChild.onmouseout = OutBtn;
		o.lastChild.onclick = this.close;

		return o.parentNode.parentNode.parentNode;
	};

	this.setContext = function(widget, tag)
	{
		if (typeof widget == "object")
			widget.firstChild.lastChild.insertAdjacentHTML("beforeEnd", tag);
	};

	this.getStatus = function(widget)
	{
		widget = getWidget(widget);
		if (typeof widget != "object")
			return 0002;
		for (var y = 0; y < domObj.childNodes.length; y++)
		{
			for (var x = 0; x < domObj.childNodes[y].childNodes.length; x++)
			{
				if (domObj.childNodes[y].childNodes[x] == widget)
				{
					if (widget.firstChild.lastChild.style.display == "none")
						return y * 1000 + x * 10 + 1;
					return y * 1000 + x * 10;
				}
			}
		}
		return -1;
	};

	function changeLayer(newMode)
	{
		var colold = nMode % 10;
		var colnew = newMode % 10;
		for (var x = 0; x < colnew - colold; x++)
			domObj.insertAdjacentHTML("beforeEnd", "<div style='float:right;width:33%;overflow-x:hidden;'></div>");
			
		for (var x = 0; x < colold - colnew; x++)
		{
			for (var y = domObj.childNodes[colnew + x].childNodes.length - 1; y >= 0; y--)
				domObj.childNodes[0].insertAdjacentElement("beforeEnd", domObj.childNodes[colnew + x].childNodes[y]);
			domObj.childNodes[colnew + x].removeNode(true);	
		}
		switch (newMode)
		{
		case 1:
			domObj.childNodes[0].style.width = "100%";
			break;
		case 2:
			domObj.childNodes[0].style.width = "50%";
			domObj.childNodes[1].style.width = "50%";
			break;
		case 3:
			domObj.childNodes[0].style.width = "33%";
			domObj.childNodes[1].style.width = "34%";
			domObj.childNodes[2].style.width = "33%";
			break;
		case 12:
			domObj.childNodes[0].style.width = "66%";
			domObj.childNodes[1].style.width = "34%";
			break;
		case 22:
			domObj.childNodes[0].style.width = "34%";
			domObj.childNodes[1].style.width = "66%";
			break;
		}
		nMode = newMode;
	}

	if (typeof domObj != "object")
		domObj = root;
	switch (nMode)
	{
	case 1:
		domObj.insertAdjacentHTML("beforeEnd", "<div style='float:left;width:100%;overflow-x:hidden;'></div>");
		break;
	case 2:
		domObj.innerHTML = "<div style='float:left;width:50%;overflow-x:hidden;'></div>" +
			"<div style='float:left;width:50%;overflow-x:hidden;'></div>";
		break;
	case 3:
		domObj.innerHTML = "<div style='float:left;width:33%;overflow-x:hidden;'></div>" +
			"<div style='float:left;width:34%;overflow-x:hidden;'></div>" +
			"<div style='float:left;width:33%;overflow-x:hidden;'></div>";
		break;
	case 12:
		domObj.innerHTML = "<div style='float:left;width:66%;overflow-x:hidden;'></div>" +
			"<div style='float:left;width:34%;overflow-x:hidden;'></div>";
		break;
	case 13:
		domObj.innerHTML = "<div style='float:left;width:40%;overflow-x:hidden;'></div>" +
			"<div style='float:left;width:40%;overflow-x:hidden;'></div>" +
			"<div style='float:left;width:20%;overflow-x:hidden;'></div>";
		break;
	case 22:
		domObj.innerHTML = "<div style='float:left;width:34%;overflow-x:hidden;'></div>" +
			"<div style='float:left;width:64%;overflow-x:hidden;'></div>";
		break;
	case 23:
		domObj.innerHTML = "<div style='float:left;width:20%;overflow-x:hidden;'></div>" +
			"<div style='float:left;width:40%;overflow-x:hidden;'></div>" +
			"<div style='float:left;width:40%;overflow-x:hidden;'></div>";
		break;
	}
}


//日历牌对象
function CalendarBase(tday, domobj, lunarDis)
{
	var self = this;
	var year, month, day, oSel, mode = 0;
	domobj.innerHTML = "<div id=TitleDiv><span title=后退 id=DecMonth style=font-family:webdings;cursor:hand;>3</span>&nbsp;" +
		"<span id=YearSpan style='color:#000;'></span>年<span id=MonthTag><span id=MonthSpan style='color:#000;'></span>月</span>&nbsp;" +
		"<span id=AddMonth title=前进 style=font-family:webdings;cursor:hand;>4</span></div><div style='margin-top:-20px;padding-top:20px;" +
		"overflow:hidden;height:100%;filter:progid:DXImageTransform.Microsoft.GradientWipe(GradientSize=0.00,wipestyle=0,motion=c)'></div>";
	var oDiv = domobj.lastChild;
	oDiv.onclick = ClickTable;
	domobj.firstChild.onclick = ClickTitle;
	this.show = function(d)
	{
		InitDate(d);
		var daytext = "";
		var today = new Date();
		var mday = new Date(tday.getTime());
		mday.setDate(1);
		var ww = mday.getDay();
		var lunar;
		var tag = "<tr>";
		for (var x = 0; x < ww; x++)
			tag += "<td id=weekday" + x + "></td>";
		if ((typeof lunarDis == "undefined") || (lunarDis == false))
			lunar = new LunarDate(mday);
		while (month == mday.getMonth() + 1)
		{
			if (ww == 0)
				tag += "</tr><tr>";
			if (typeof lunar == "object")
			    daytext = "<div class=\"day\" style=\"display:block;font:9px 微软雅黑;color:gray;\">" + 
					 lunar.toString(3) + "</div>";
			tag += "<td id=weekday" + x + " node=" + mday.getDate() + ">";
			if ((mday.getDate() == today.getDate()) && (mday.getFullYear() == today.getFullYear())
				&&(mday.getMonth() == today.getMonth()))	
				tag += "<b>" +  mday.getDate() + daytext + "</b></td>";
			else
				tag += mday.getDate() + daytext + "</td>";
					
			mday.setDate(mday.getDate() + 1);
			if (typeof lunar == "object")
				lunar.setLunar(mday);
			ww = mday.getDay();
		}
		if (ww > 0)
		{
			for (x = ww; x < 7; x++)
				tag += "<td id=weekday" + x + "></td>";
		}
		ShowTitle(tday.getFullYear(), month);
		oDiv.innerHTML = "<table border=0 cellpadding=0 cellspacing=0 style=width:100%;height:100%;><tr><th id=week0>日</th><th id=week1>一</th>" +
			"<th id=week2>二</th><th id=week3>三</th><th id=week4>四</th><th id=week5>五</th><th id=week6>六</th></th>" + tag + "</tr></table>";
		oSel = new CommonShadow(0, "#f4b77e");
		if (typeof this.onReady == "function")
			this.onReady();
	};

	function InitDate(d)
	{
		if (typeof d != "undefined")
			tday = d;
		if ((typeof tday == "string") && (tday != ""))
			tday = GetDate(tday);

		if ((typeof tday != "object") || isNaN(tday))
			tday = new Date();
		year = tday.getFullYear();
		month = tday.getMonth() + 1;
		day = tday.getDate();
	}
	
	function ShowTitle(year, month)
	{
		domobj.all.YearSpan.innerText = year;
		if ((typeof month == "undefined") || (month == 0))
			domobj.all.MonthTag.style.display = "none";
		else
		{
			domobj.all.MonthTag.style.display = "inline";
			domobj.all.MonthSpan.innerText = month;
		}
	}
	
	function ClickTitle()
	{
		switch (event.srcElement.id)
		{
		case "DecMonth":
			switch (mode)
			{
			case 0:
				InitDate(year + "-" + (month - 1) + "-" + day);
				break;
			case 1:
				InitDate((year - 1) + "-" + month + "-" + day);
				break;
			case 2:
				InitDate((year - 20) + "-" + month + "-" + day);
				break;
			}
//			oDiv.filters[0].Motion = "forward";
//			oDiv.filters[0].apply();
			ShowAll(mode);
//			oDiv.filters[0].play();
			break;
		case "AddMonth":
			switch (mode)
			{
			case 0:
				InitDate(year + "-" + (month + 1) + "-" + day);
				break;
			case 1:
				InitDate((year + 1) + "-" + month + "-" + day);
				break;
			case 2:
				InitDate((year + 20) + "-" + month + "-" + day);
				break;
			}
//			oDiv.filters[0].Motion = "reverse";
//			oDiv.filters[0].apply();
			ShowAll(mode);
//			oDiv.filters[0].play();
			break;
		case "MonthSpan":
			ShowAll(1);
			break;
		case "YearSpan":
		default:
			ShowAll(2);
			break;
		}
	}
	
	function ShowAll(m)
	{
		var tag, y;
		mode = m;
		switch (mode)
		{
		case 0:
			self.show();
			return;
		case 1:
			ShowTitle(year);
			tag = "<tr><td>一月</td><td>二月</td><td>三月</td><td>四月</td></tr>" +
				"<tr><td>五月</td><td>六月</td><td>七月</td><td>八月</td></tr>" +
				"<tr><td>九月</td><td>十月</td><td>十一月</td><td>十二月</td></tr>";
			break;
		case 2:
			var y0 = year - year % 20;
			ShowTitle(y0 + "-" + (y0 + 19));
			for (tag = "", y = y0; y < y0 + 20; y += 4)
				tag += "<tr><td>" + y + "</td><td>" + (y + 1) + "</td><td>" + (y + 2) + "</td><td>" + (y + 3) + "</td></tr>";
			break;
		}
		oDiv.innerHTML = "<table border=0 cellpadding=0 cellspacing=0 style=width:100%;>" + tag + "</table>";
		for (var x = 0; x < oDiv.all.length; x++)
			oDiv.all[x].UNSELECTABLE = "on";
	}
	
	function ClickTable()
	{
		if (event.srcElement.node == "")
			return;
		var obj;
		if (event.srcElement.tagName == "TD")
			 obj = event.srcElement;
		if (event.srcElement.parentNode.tagName == "TD") 
			obj = event.srcElement.parentNode;
		if (typeof obj != "object")
			return;
		oSel.show(obj);
		switch (mode)
		{
		case 0:
			day = obj.node;
			if (typeof self.clickDate == "function")
				self.clickDate(year + "-" + month + "-" + day, obj);
			break;
		case 1:
			InitDate(year + "-" + (obj.parentNode.rowIndex * 4 + obj.cellIndex + 1) + "-" + day);
			ShowAll(0);
			break;
		case 2:
			year = parseInt(obj.innerText);
			ShowAll(1);
			break;
		}
	}
	
	this.setDateCellProp = function(d, item, value)
	{
		var o = this.getCellObject(d);
		if (o != null)
		{
			if (item.substr(0, 1) == ".")
				o.style.setAttribute(item.substr(1), value);
			else
				o.setAttribute(item, value);
		}
	};
	
	this.getDateCellProp = function(d, item)
	{
		var o = this.getCellObject(d);
		if (o != null)
		{
			if (item.substr(0, 1) == ".")
				return o.style.getAttribute(item.substr(1));
			else
				return o.getAttribute(item);
		}
	};
	
	this.getCellObject = function(d)
	{
		if (typeof d == "string")
			d = GetDate(d);
		var oCells = oDiv.firstChild.cells;
		for (var x = 0; x < oCells.length; x++)
		{
			if (d.getDate() == oCells[x].node)
				return oCells[x];
		}
		return null;
	};
		
	this.getDate = function()
	{
		return new Date(year, month - 1, day);
	};
	
	this.selDateCell = function(d)
	{
		var o = this.getCellObject(d);
		if (o != null)
			oSel.show(o);
	};
}

//农历对象
function LunarDate(dateobj)
{
	if (typeof LunarDate.TermData == "undefined")
	{
		LunarDate.TermData = [0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693, 263343, 285989,
		    308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758];

		LunarDate.lunarInfo = [0x4bd8, 0x4ae0, 0xa570, 0x54d5, 0xd260, 0xd950, 0x5554, 0x56af,
			0x9ad0, 0x55d2, 0x4ae0, 0xa5b6, 0xa4d0, 0xd250, 0xd255, 0xb54f, 0xd6a0, 0xada2,
			0x95b0, 0x4977, 0x497f, 0xa4b0, 0xb4b5, 0x6a50, 0x6d40, 0xab54, 0x2b6f, 0x9570,
			0x52f2, 0x4970, 0x6566, 0xd4a0, 0xea50, 0x6a95, 0x5adf, 0x2b60, 0x86e3, 0x92ef,
			0xc8d7, 0xc95f, 0xd4a0, 0xd8a6, 0xb55f, 0x56a0, 0xa5b4, 0x25df, 0x92d0, 0xd2b2,
			0xa950, 0xb557, 0x6ca0, 0xb550, 0x5355, 0x4daf, 0xa5b0, 0x4573, 0x52bf, 0xa9a8,
			0xe950, 0x6aa0, 0xaea6, 0xab50, 0x4b60, 0xaae4, 0xa570, 0x5260, 0xf263, 0xd950,
			0x5b57, 0x56a0, 0x96d0, 0x4dd5, 0x4ad0, 0xa4d0, 0xd4d4, 0xd250, 0xd558, 0xb540,
			0xb6a0, 0x95a6, 0x95bf, 0x49b0, 0xa974, 0xa4b0, 0xb27a, 0x6a50, 0x6d40, 0xaf46,
			0xab60, 0x9570, 0x4af5, 0x4970, 0x64b0, 0x74a3, 0xea50, 0x6b58, 0x5ac0, 0xab60,
			0x96d5, 0x92e0, 0xc960, 0xd954, 0xd4a0, 0xda50, 0x7552, 0x56a0, 0xabb7, 0x25d0,
			0x92d0, 0xcab5, 0xa950, 0xb4a0, 0xbaa4, 0xad50, 0x55d9, 0x4ba0, 0xa5b0, 0x5176,
			0x52bf, 0xa930, 0x7954, 0x6aa0, 0xad50, 0x5b52, 0x4b60, 0xa6e6, 0xa4e0, 0xd260, 
			0xea65, 0xd530, 0x5aa0, 0x76a3, 0x96d0, 0x4afb, 0x4ad0, 0xa4d0, 0xd0b6, 0xd25f,
			0xd520, 0xdd45, 0xb5a0, 0x56d0, 0x55b2, 0x49b0, 0xa577, 0xa4b0, 0xaa50, 0xb255,
			0x6d2f, 0xada0, 0x4b63, 0x937f, 0x49f8, 0x4970, 0x64b0, 0x68a6, 0xea5f, 0x6b20,
			0xa6c4, 0xaaef, 0x92e0, 0xd2e3, 0xc960, 0xd557, 0xd4a0, 0xda50, 0x5d55, 0x56a0,
			0xa6d0, 0x55d4, 0x52d0, 0xa9b8, 0xa950, 0xb4a0, 0xb6a6, 0xad50, 0x55a0, 0xaba4,
			0xa5b0, 0x52b0, 0xb273, 0x6930, 0x7337, 0x6aa0, 0xad50, 0x4b55, 0x4b6f, 0xa570,
			0x54e4, 0xd260, 0xe968, 0xd520, 0xdaa0, 0x6aa6, 0x56df, 0x4ae0, 0xa9d4, 0xa4d0, 
			0xd150, 0xf252, 0xd520];

		LunarDate.chMonth = "正二三四五六七八九十冬腊";
		LunarDate.chDate = "初一初二初三初四初五初六初七初八初九初十十一十二十三十四十五十六十七十八十九二十廿一廿二廿三廿四廿五廿六廿七廿八廿九三十";
		LunarDate.TianGan = "甲乙丙丁戊己庚辛壬癸";
		LunarDate.DiZhi = "子丑寅卯辰巳午未申酉戌亥";
		LunarDate.Animals = "鼠牛虎兔龙蛇马羊猴鸡狗猪";
		LunarDate.TermName = "小寒大寒立春雨水惊蛰春分清明谷雨立夏小满芒种夏至小暑大暑立秋处暑白露秋分寒露霜降立冬小雪大雪冬至";
	}
	var year, month, isLeap, day, term, sterm;

	function lYearDays(y)	//传回农历 y年的总天数
	{  
		var sum = 348;
		for (var x = 0x8000; x > 0x8; x >>= 1) 
			sum += (LunarDate.lunarInfo[y - 1900] & x) ? 1: 0;
 		return sum + leapDays(y);
	}

	function leapDays(y)	//传回农历 y年闰月的天数
	{
		if (leapMonth(y) == 0)
			return 0;
		return ((LunarDate.lunarInfo[y - 1899] & 0xf) == 0xf) ? 30 : 29;
	}



	function leapMonth(y)	//传回农历 y年闰哪个月 1-12 , 没闰传回 0
	{
		var rtn = LunarDate.lunarInfo[y - 1900] & 15;
		if (rtn == 15)
			return 0;
		return rtn;
	}

	function monthDays(y, m)	//传回农历 y年m月的总天数
	{
		return (LunarDate.lunarInfo[y - 1900] & (0x10000 >> m)) ? 30: 29;
	}

	function toDate(dt)
	{
		if (typeof dt == "object")
			return dt;
		if (typeof dt == "string")
		{
			var ss = dt.split("-");
			if (ss.length > 2)
				return new Date(ss[0], parseInt(ss[1]) - 1, ss[2]);
		}
		return new Date();
	}

	this.setLunar = function(dt)
	{
		var leap = 0, temp, x;
		dt = toDate(dt);
//	   	if ((dt.getFullYear() < 1900) || (dt.getFullYear() > 2100))
//			return;
		var baseDate = new Date(1900,0,31);
		var offset = parseInt((dt - baseDate) / 86400000);	//24*3600*1000 = 86400000

		this.dayCyl = offset + 40;
		this.monCyl = 14;
		dateobj = dt;

		for (var x = 1900; x < 2100 && offset > 0; x ++)
		{
			temp = lYearDays(x);
			offset -= temp;
			this.monCyl += 12;
		}
		if (offset < 0)
		{
		 	offset += temp;
			x --;
			this.monCyl -= 12;
		}
		year = x;
//		this.yearCyl = x - 1864;

	   leap = leapMonth(x); //闰哪个月
	   isLeap = false;

		for (x = 1; x < 13 && offset > 0; x ++)
		{	//闰月
			if (leap > 0 && x == (leap + 1) && isLeap == false)
			{
				x --;
				isLeap = true;
				temp = leapDays(year);
			}
			else
				temp = monthDays(year, x);

			//解除闰月
			if (isLeap == true && x == (leap + 1))
				isLeap = false;

			offset -= temp;
//			if (this.isLeap == false)
//				this.monCyl ++;
		}

 		if (offset == 0 && leap > 0 && x == leap + 1)
 		{
      		if(isLeap)
				isLeap = false;
			else
			{
				isLeap = true;
				x --;
//				this.monCyl --;
			}
		}
		if (offset < 0)
		{
			offset += temp;
			x --;
//			this.monCyl --;
		}

		month = x;
		day = offset + 1;
		term = 0;
		sterm = "";
		offset = dateobj.getMonth() * 2;
		for (x = offset; x < offset + 2; x++)
		{
			temp = (31556925974.7 * (dateobj.getFullYear() - 1900) + LunarDate.TermData[x] * 60000);
			baseDate = new Date(1900, 0, 6, 2, 5);
			baseDate.setTime(baseDate.getTime() + temp);
			if (baseDate.getDate() == dateobj.getDate())
			{
				term = x + 1;
				sterm = LunarDate.TermName.substring(x * 2, term * 2);
				break;
			}
		}
	};

	this.toString = function (nType)
	{
		if ((dateobj.getFullYear() < 1900) || (dateobj.getFullYear() > 2100))
			return "";
		switch (nType)
		{
		case 1:			//年月日
			return LunarDate.TianGan.substring((year - 1864) % 10, (year - 1864) % 10 + 1) + 
				LunarDate.DiZhi.substring((year - 1864) % 12, (year - 1864) % 12 + 1) +
				"年 " + LunarDate.chMonth.substring(month - 1, month) + "月 " +
				LunarDate.chDate.substring(day * 2 - 2, day * 2);
		case 2:			//月日
			return LunarDate.chMonth.substring(month - 1, month) + "月 " +
				LunarDate.chDate.substring(day * 2 - 2, day * 2);
		case 3:			//(节气/月/日)
			if (sterm != "")
				return sterm;
			if (day == 1)
				return LunarDate.chMonth.substring(month - 1, month) + "月";
			return LunarDate.chDate.substring(day * 2 - 2, day * 2);
		default:		//年 属相 月 日 节气
			return LunarDate.TianGan.substring((year - 1864) % 10, (year - 1864) % 10 + 1) + 
				LunarDate.DiZhi.substring((year - 1864) % 12, (year - 1864) % 12 + 1) +
				"年 属相:" + LunarDate.Animals.substring((year - 1864) % 12, (year - 1864) % 12 + 1) +
				" " + LunarDate.chMonth.substring(month - 1, month) + "月 " +
				LunarDate.chDate.substring(day * 2 - 2, day * 2) + sterm;
		}
	};
	this.setLunar(dateobj);
} 

function GridView(domobj, head, data, foot, cfg)
{
var self = this;
var dragobj, dragindex, dragdelta, evtobj, dragparam;
var headmenu, rollshadow, selshadow, quirks = 0;
var expic = ["com/pic/minus.gif", "com/pic/plus.gif"];
	function createGrid()
	{
		if (typeof head != "object")
			return;
		var tag = "<div id=_GridDiv style='width:100%;height:100%;overflow:hidden;'>" +
			"<div id=HeadDiv style='width:100%;overflow:hidden;background-color:#78BCED'>" +
			"<table id=FieldsHead cellpadding=0 cellspacing=0 border=0 class=gridhead>";
		tag += "<tr id=HeadTR>";
		if (cfg.bodystyle == 2)
			tag += "<td nowrap align=center><div style=width:20px><input type=checkbox></div></td>";
		for (var x = 0; x < head.length; x++)
		{
			if ((head[x].nShowMode == 1) || (head[x].nShowMode == 7) || (head[x].nShowMode == 9))
				tag += "<td nowrap node=" + head[x].FieldName + "><div style=width:" + head[x].nWidth + "px;overflow:hidden;>" + head[x].TitleName + "</div></td>";
		}
		tag += "<td nowrap style='width:100%'><div style=width:30px></div></td></tr></table></div><div style='height:100%;overflow:hidden'>" +
			"<div id=BodyDiv class=gridbodycontainer style=width:100%;height:100%;overflow:auto;>" +
			"<table id=BodyTable height=100% cellpadding=3 cellspacing=1 border=0 bgcolor=#DDDDDD>";

		domobj.innerHTML = tag + "</table></div></div>" + getfoot() + "</div>";
		domobj.all._GridDiv.onresize = scroll;
		domobj.all.FieldsHead.onclick = click;
		domobj.all.FieldsHead.ondblclick = dblclick;
		domobj.all.FieldsHead.onmousedown = mousedown;
		domobj.all.FieldsHead.onmouseover = over;
		if (cfg.headstyle == 1)
			domobj.all.FieldsHead.oncontextmenu = showheadmenu;
		self.reload(data);
		var h = domobj.all.HeadDiv.clientHeight;
		if (typeof domobj.all.PageFoot == "object")
			h += domobj.all.PageFoot.clientHeight;
		domobj.all._GridDiv.style.paddingBottom = (h + 3) + "px";
	}

	function createTable()
	{
		var tag = "<div style='width:100%;height:100%;padding-bottom:25px;overflow:hidden'><div style=width:100%;height:100%;overflow:auto>" +
			"<table id=SeekTable width=100% height=100% cellpadding=3 cellspacing=0 border=0>";
		tag += "<tr id=SeekTitleTR>"; 
		for (var x = 0; x < head.length; x++)
		{
			if (head[x].nShowMode == 1)
				tag += "<td node=" + head[x].FieldName + ">" + head[x].TitleName + "</td>";
		}
		tag += "</tr>" + getbody(cfg.gridstyle);
		domobj.innerHTML = tag +"</table></div>" + getfoot() + "</div>";
		domobj.all.SeekTable.onclick = click;
		domobj.all.SeekTable.onmouseover = over;
	}

	function getbody(nStyle, items, depth, node)
	{
		var tag = "", divstyle = "";
		var bk = ["white"];
		if (typeof cfg.bodybkcolor == "string")
			bk = cfg.bodybkcolor.split(",");
		var fg = "black";
		if (typeof cfg.bodycolor == "string")
			fg = cfg.bodycolor;
		var hint, tds, nowrap = " nowrap";
		if (cfg.nowrap == 0)
			nowrap = "";
		if (typeof items != "object")
			items = data;
		if (typeof depth != "number")
			depth = 0;
		if (depth > 0)
			divstyle = "padding-left:" + depth * cfg.nIndent + "px;";
		if ((node == "") || (typeof node == "undefined"))
			node = "";
		else
			node += ",";
		var treeflag = 0;
		for (var y = 0; y < items.length; y++)
		{
			hint = "";
			tds = "";
			for (var x = 0; x < head.length; x++)
			{
				switch (head[x].nShowMode)
				{
				case 1:			//标题
				case 7:			//转义
					tds += getTDTag(items[y][head[x].FieldName], x, nStyle, fg, nowrap, "");
					break;
				case 9:			//树型
					treeflag = 1;
					var value = items[y][head[x].FieldName];
					if (typeof items[y].child == "object")
					{
						var ex = "<img id=BtExTree ex=0 src=" + expic[0] + ">&nbsp;";
						if (depth >= cfg.initDepth - 1)
							ex = "<img id=BtExTree unloadflag=1 ex=1 src=" + expic[1] + ">&nbsp;";
						if (typeof value == "object")
							value.value = ex + value.value;
						else
							value = ex + value;
						tds += getTDTag(value, x, nStyle, fg, nowrap, divstyle);
						break;
					}
					else
						tds += getTDTag(value, x, nStyle, fg, nowrap, divstyle);
					
					break;
				case 2:			//内文
					break;
				case 3:			//注释
					hint += head[x].TitleName + ":" + items[y][head[x].FieldName] + "\n";
					break;
				case 4:			//禁止
					break;
				case 5:			//浮窗
					break;
				case 6:			//隐藏
					break;
				case 8:			//附属
					break;
				}
			}
			if (cfg.bodystyle == 2)
				tds = "<td nowrap align=center><div style=width:20px><input type=checkbox></div></td>" + tds;
			var c = bk[y % bk.length];
			if (typeof items[y]._lineControl == "object")
			{
				items[y]._lineControl = FormatObjvalue({bgcolor:"white"}, items[y]._lineControl);
				c = items[y]._lineControl.bgcolor;
			}
			tag += "<tr node=" + (node + y) + " bgcolor=" + c + " title=\"" + hint + "\">" + tds + "</tr>";
			if ((treeflag == 1) && (typeof items[y].child == "object") && (depth < cfg.initDepth - 1))
				tag += getbody(nStyle, items[y].child, depth + 1, node + y);
		}
		return tag;
	}

	function getTDTag(value, x, nStyle, color, nowrap, divstyle)
	{
		if (typeof value == "undefined")
			return "";
		if (typeof value == "object")
		{
			value = FormatObjvalue({value:"", colspan:1, rowspan:1, tdstyle:""}, value);
			var tag = "<td" + nowrap + " colspan=" + value.colspan + " rowspan=" + value.rowspan;
			if (value.tdstyle != "")
				tag += " style=" + value.tdstyle;
			tag += " id=" + head[x].FieldName + "_TD>";
			if ((value.colspan > 1) || (value.rowspan > 1))
				quirks = 1;
			value = value.value;
		}
		else
			var tag = "<td" + nowrap + " id=" + head[x].FieldName + "_TD>";
		if (nStyle == 1)
			tag += "<div style=\"width:" + head[x].nWidth + "px;color:" +
				color + ";overflow-x:hidden;" + divstyle + "\">" + getvalue(value, head[x].exp) + "</div></td>";
		else
			tag += value + "</td>";
		return tag;
	}
	
	function getvalue(value, exp)
	{
		if (typeof exp == "function")
			return exp(value);

		if (typeof exp == "string")
		{
			switch (exp.substr(0, 1))
			{
			case "&":
				if (exp.substr(1, 1) == "d")
				{
					var d = GetDate(value);
					switch (exp.substr(3,1))
					{
					case "1":
						return d.getYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
					case "2":
						return d.getYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() +
							" " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
					case "3":
						return d.getYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() +
							" " + d.getHours() + ":" + d.getMinutes();
					case "4":
						return d.getHours() + ":" + d.getMinutes();
					}
				}
				break;
			case "(":
				exp = exp.substr(1, exp.length - 2);
			default:
				var ss = exp.split(",");
				for (var x = 0; x < ss.length; x++)
				{
					var sss = ss[x].split(":");
					if (value == sss[0])
						return sss[1];
				}
			}
		}
		return value;
	}

	function getfoot()
	{
		if (typeof foot != "object")
			return "";

		switch (cfg.footstyle)
		{
		case 0:
			return "";
		case 1:
		case 2:
			return "<div id=PageFoot style='height:25px;padding-top:4px'>页次：" + foot.nPage + "/" + foot.Pages +
				"，每页" + foot.PageSize + "条，共" + foot.Records +"条</div>";
			break;
		}
	}
	
	function showheadmenu()
	{
		if (event.shiftKey)
			return;
		if (typeof headmenu != "object")
		{
			var menudef = [{item:"从小到大排序", action:self.orderRow},{item:"从大到小排序", action:self.orderRow}, {}];
			for (var x = 0; x < head.length; x++)
			{
				menudef[x + 3] = {};
				menudef[x + 3].item = head[x].TitleName;
				menudef[x + 3].img = "<input type=checkbox";
				if (head[x].nShowMode == 1);
					menudef[x + 3].img += " checked";
				menudef[x + 3].img += ">";
				menudef[x + 3].action = hidecol;
				menudef[x + 3].FieldName = head[x].FieldName;
			}
			headmenu = new CommonMenu(menudef);
		}
		headmenu.show();
		return false;
	}
	
	function hidecol(obj, item)
	{
		var index = sethead(item.FieldName);
		if (head[index].nShowMode == 1)
		{
			item.img = "<input type=checkbox>";
			head[index].nShowMode = 4;
		}
		else
		{
			item.img = "<input type=checkbox checked>";
			head[index].nShowMode = 1;
		}
		init();
	}

	function scroll()
	{
		domobj.all.HeadDiv.scrollLeft = domobj.all.BodyDiv.scrollLeft;
	}
	
	function DisEditor()
	{
		if (typeof head != "object")
			return;
		for (var x = 0; x < head.length; x++)
		{
			if (typeof head[x].Editor == "object")
				head[x].Editor.hide();
		}
	}

	function over()
	{
		if (event.srcElement.tagName == "TD")
		{
			var pos = GetObjPos(event.srcElement);
			if (event.clientX >= pos.right - 2)
				event.srcElement.style.cursor = "col-resize";
			else
				event.srcElement.style.cursor = "default";
		}
		else
			event.srcElement.style.cursor = "default";
		
		var td = FindParentObject(event.srcElement, domobj, "TD");
		if (typeof td != "object")
			return; 
		if ((td.parentNode.id != "SeekTitleTR") && (td.parentNode.id != "HeadTR"))
			self.overRow(td);
	}
	
	function mousedown()
	{
		evtobj = event.srcElement;
		if (evtobj.style.cursor != "col-resize")
		{
			if ((evtobj.parentNode.parentNode.id == "HeadTR") && (event.shiftKey == false))
			{
				if (sethead(evtobj.parentNode.node) >= 0)
				{
					dragdelta = 0;
					document.attachEvent("onmousemove", draghead);
					document.attachEvent("onmouseup", dragheadend);
				}
			}
			if (cfg.bodystyle == 3)	//拖动多选
			{
				document.attachEvent("onmouseup", selearea);
				
			}
			return false;
		}
		if (evtobj.parentNode.id == "HeadTR")
			dragindex = evtobj.cellIndex;
		else
			dragindex = sethead(evtobj.id.substr(0, evtobj.id.length - 3));
		var pos = GetObjPos(domobj);
		var h = pos.bottom - pos.top;
		if (cfg.footstyle > 0)
			h -= 25;
		dragobj = document.createElement("<div style=position:absolute;width:1px;background-color:gray;overflow:hidden;left:" +
			event.clientX + ";top:" + pos.top + ";height:" + h + ";cursor:col-resize></div>");
		dragobj.setCapture();
		document.body.insertBefore(dragobj);
		document.attachEvent("onmousemove", splitting);
		document.attachEvent("onmouseup", splitend);
	}
	
	function draghead()
	{
		if ((dragdelta < 5) && (typeof dragobj != "object"))
		{
			dragdelta ++;
			return false;
		}
		if (typeof dragobj != "object")
		{
			var pos = GetObjPos(evtobj.parentNode);
			dragobj = document.createElement("<div style='position:absolute;background-color:#78BCED;width:" +
				(pos.right - pos.left) + "px;height:" + (pos.bottom - pos.top) + "px;top:" +
				pos.top + "px;left:" + pos.left + "px;overflow:hidden;border:1px solid gray;'></div>");
			document.body.insertBefore(dragobj);
			dragobj.innerHTML = evtobj.innerText;
			dragdelta = event.x - pos.left;
			dragindex = evtobj.parentNode.cellIndex;
			dragobj.setCapture();
			evtobj = undefined;
		}
		dragobj.style.left = event.x - dragdelta;
		var tr = domobj.all.HeadTR;
		for (var x = 0; x < tr.cells.length; x++)
		{
			if ((x < tr.cells.length - 1) && (sethead(domobj.all.FieldsHead.rows[0].cells[x].node) < 0))
				continue;
			var pos = GetObjPos(tr.cells[x]);
			if ((event.x - dragdelta > pos.left) && (event.x - dragdelta < pos.right))
			{
				if (typeof evtobj != "object")
				{
					var p = GetObjPos(domobj);
					evtobj = document.createElement("<div style='position:absolute;width:1px;background-color:green;top:" +
						p.top + "px;height:" + (p.bottom - p.top - 25) + "px;overflow:hidden;'></div>");				
					document.body.insertBefore(evtobj);
				}
				evtobj.style.left = pos.left;
				dragparam = x;
				break;
			}
		}
	}
	
	function dragheadend()
	{
		document.detachEvent("onmousemove", draghead);
		document.detachEvent("onmouseup", dragheadend);
		document.releaseCapture();
		if (typeof dragobj != "object")
			return;
		dragobj.removeNode(true);
		dragobj = undefined;
		evtobj.removeNode(true);
		evtobj = undefined;

		if (dragparam == dragindex)
			return;
		var dndx = sethead(domobj.all.FieldsHead.rows[0].cells[dragparam].node);
		var sndx = sethead(domobj.all.FieldsHead.rows[0].cells[dragindex].node);
		if (dndx < 0)
		{
			var item = head.splice(sndx, 1);
			head[head.length] = item[0];
		}
		else
		{
			var item = head.splice(sndx, 1);
			if (sndx < dndx)
				dndx --;
			head.splice(dndx, 0, item[0]);
		}
		if (dragparam < dragindex)
			dragindex ++;
		domobj.all.FieldsHead.rows[0].insertCell(dragparam);
		domobj.all.FieldsHead.rows[0].cells[dragparam].replaceNode(domobj.all.FieldsHead.rows[0].cells[dragindex]);
		if (quirks == 0)
		{
			for (var x = 0; x < domobj.all.BodyTable.rows.length; x++)
			{
				domobj.all.BodyTable.rows[x].insertCell(dragparam);
				domobj.all.BodyTable.rows[x].cells[dragparam].replaceNode(domobj.all.BodyTable.rows[x].cells[dragindex]);
			}
		}
		else
			self.reload(data);
		scroll();		
	}
	
	function selearea()
	{
		document.detachEvent("onmouseup", selearea);
		if (event.shiftKey)
			return;
return;
 		var rg = document.selection.createRange();
 		window.status = rg.boundingTop + "-" + rg.boundingHeight;
		var el = rg.parentElement();
//		alert(el.tagName);
 		return;
 		var oRcts = rg.getClientRects();
		for (var x = 0; x < oRcts.length; x++)
   			window.status = (oRcts[x].top + "," + oRcts[x].bottom);
	}
	
	function splitting()
	{
		dragobj.style.left = event.x - 2;
	}
	
	function splitend()
	{
		document.detachEvent("onmousemove", splitting);
		document.detachEvent("onmouseup", splitend);
		document.releaseCapture();
		dragobj.removeNode(true);
		dragobj = undefined;
		var pos = GetObjPos(domobj.all.FieldsHead.rows[0].cells[dragindex]);
		var w = event.x - pos.left - 3;
		if (w < 2)
			w = 2;
		domobj.all.FieldsHead.rows[0].cells[dragindex].firstChild.style.width = w;
		sethead(domobj.all.FieldsHead.rows[0].cells[dragindex].node, "nWidth", w);
		if (quirks == 0)
		{
			for (var x = 0; x < domobj.all.BodyTable.rows.length; x++)
				domobj.all.BodyTable.rows[x].cells[dragindex].firstChild.style.width = w;
		}
		else
			self.reload(data);
		scroll();
	}
	
	function sethead(name, prop, value)
	{
		for (var x = 0; x < head.length; x++)
		{
			if (head[x].FieldName == name)
			{
				if (typeof prop != "undefined")
					head[x][prop] = value;
				return x;
			}
		}
		return -1;
	}
	
	function click()
	{
		if (event.srcElement.id == "BtExTree")
			return expandTreeLine(event.srcElement);
		var td = FindParentObject(window.event.srcElement, domobj, "TD");
		if (typeof td != "object")
			return;
		if ((td.parentNode.id != "SeekTitleTR") && (td.parentNode.id != "HeadTR"))
		{
			self.clickRow(td);
		}
		else
			self.clickHead(td);
	}

	function expandTreeLine(obj, flag)
	{
		var tr = obj.parentNode.parentNode.parentNode;
		var depth = tr.node.split(",").length;
		if ((((flag == 1) || (flag == true)) && (obj.ex == 0))
			|| (((flag == 0) || (flag == false)) && (obj.ex == 1)))
			return
		if (obj.ex == 1)
		{
			obj.ex = 0;
			obj.src = expic[0];
			var dis = "inline";
			if (obj.unloadflag == 1)
			{
				var oDiv = document.createElement("DIV");
				var item = self.getItemData(tr.node);
				oDiv.innerHTML = "<table>" + getbody(cfg.gridstyle, item.child, depth + 1, tr.node) + "</table>";
				for (var x = oDiv.firstChild.rows.length - 1; x >= 0; x--)
					tr.insertAdjacentElement("afterEnd", oDiv.firstChild.rows[x]);
				obj.removeAttribute("unloadflag");
				oDiv.removeNode(true);
			}
		}
		else
		{
			obj.ex = 1;
			obj.src = expic[1];
			var dis = "none";
		}

		for (var x = tr.rowIndex + 1; x < tr.parentNode.rows.length; x++)
		{
			var d = tr.parentNode.rows[x].node;
			if (tr.parentNode.rows[x].node.split(",").length <= depth)
				break;
			tr.parentNode.rows[x].style.display = dis;
		}
	}
	
	function dblclick()
	{
		var td = FindParentObject(window.event.srcElement, domobj, "TD");
		if (typeof td != "object")
			return;
		if ((td.parentNode.id != "SeekTitleTR") && (td.parentNode.id != "HeadTR"))
			self.dblclickRow(td);
		else
			self.dblclickHead(td);
	}
	
	function setEditor(headindex)
	{
		if (typeof head[headindex].Editor != "object")
			return;
		if (self.cellchange != null)
			head[headindex].Editor.valueChange = self.cellchange;
		for (var x = 0; x < domobj.all.BodyTable.rows.length; x++)
			head[headindex].Editor.attach(domobj.all.BodyTable.rows[x].all[head[headindex].FieldName + "_TD"].firstChild);
	}

	this.cellchange = function (obj)
	{
		var value = obj.innerText;
		var index = obj.parentNode.parentNode.rowIndex;
		var FieldName = obj.parentNode.id.split("_")[0];
		if (typeof data[index][FieldName] == "object")
			data[index][FieldName].value = value;
		else
			data[index][FieldName] = value;
	};

	this.setexpic = function(pic)
	{
		expic = pic;
		init();
	};
	
	this.bodymenu = function () {};
	
	this.bodyonload = function (){};
	
	this.clickRow = function (td)
	{
		var min = -1, max = -1, index, x;
		rollshadow.hide();
		if (event.shiftKey && (cfg.bodystyle == 3))
		{
			for (x = 0; x < domobj.all.BodyTable.rows.length; x++)
			{
				if (selshadow.isShadow(domobj.all.BodyTable.rows[x]) && (min == -1))
					min = x;
				if (selshadow.isShadow(domobj.all.BodyTable.rows[x]) && (x > max))
					max = x;
			}
			index = td.parentNode.rowIndex;
			
			if ((min == -1) && (max == -1))
				selshadow.show(td.parentNode);

			if (index < min)
				min = index;
			else
			{
				if (index > max)
					max = index;
				else
					min = index
			}
		selshadow.hide();
		for (x = min; x <= max; x++)
			selshadow.show(domobj.all.BodyTable.rows[x], true);
		document.selection.empty();
			
		}
		else
			selshadow.show(td.parentNode, event.ctrlKey && (cfg.bodystyle == 3));
	};
	
	this.dblclickRow = function (td) {};
	
	this.clickHead = function (td){};
	
	this.dblclickHead = function (td) {};
	
	this.keydown = function () {};
	
	this.overRow = function (td) 
	{
		if (selshadow.isShadow(td.parentNode))
			rollshadow.hide();
		else
			rollshadow.show(td.parentNode);
	};
	
	this.orderRow = function (obj, item)
	{
		alert(obj);
	};
	
	this.reload = function (body, h)
	{
		DisEditor();
		if (typeof h == "object")
		{
			head = h;
			data = body;
			init();
			return;
		}
			
		data = body;
		domobj.all.BodyDiv.innerHTML = "<table id=BodyTable cellpadding=3 cellspacing=1 border=0 bgcolor=#DDDDDD>" +
			getbody(cfg.gridstyle) + "</table>";
		domobj.all.BodyTable.onclick = click;
		domobj.all.BodyTable.ondblclick = dblclick;
		domobj.all.BodyTable.onmouseover = over;
		domobj.all.BodyTable.onmousedown = mousedown;
		domobj.all.BodyDiv.onscroll = scroll;
		domobj.all.BodyDiv.onmousewheel = DisEditor; 
		domobj.all.BodyTable.onkeydown = self.keydown;
		domobj.all.BodyTable.oncontextmenu = self.bodymenu;
		
		selshadow.hide();
		rollshadow.hide();
		for (var x = 0; x < head.length; x++)
		{
			if ((head[x].nShowMode == 1) || (head[x].nShowMode == 7))
				setEditor(x);
		}
		this.bodyonload();
	};

	this.setCell = function (index, FieldName, value)
	{
		var rows = domobj.all.BodyTable.rows;
		if (typeof value == "string")
		{
			rows[index].all[FieldName + "_TD"].firstChild.innerHTML = value;
			if (typeof data[index][FieldName] == "object")
				data[index][FieldName].value = value;
			else
				data[index][FieldName] = value;
		}
		else
		{
			data[index][FieldName] = value;
			rows[index].all[FieldName + "_TD"].firstChild.innerHTML = value.value;
			rows[index].all[FieldName + "_TD"].firstChild.style.color = value.color;
		}
	};
	this.getCell = function (index, FieldName)
	{
		return domobj.all.BodyTable.rows[index].all[FieldName + "_TD"];
	};
	
	this.getCellData = function (td)
	{
		var FieldName = td.td.id.split("_")[0];
		return data[td.parentNode.rowIndex][FieldName];
	};
	
	this.getRow = function(index)
	{
		return domobj.all.BodyTable.rows[index];
	};

	this.attachEditor = function (FieldName, editor)
	{
		var y = sethead(FieldName);
		if (typeof head[y].Editor == "object")
			this.detachEditor(FieldName);
		head[y].Editor = editor;
		setEditor(y);
	};
	
	this.detachEditor = function (FieldName)
	{
		var y = sethead(FieldName);
		var editor = head[y].Editor;
		if (typeof editor == "undefined")
			return;
		for (var x = 0; x < domobj.all.BodyTable.rows.length; x++)
			editor.detach(domobj.all.BodyTable.rows[x].all[FieldName + "_TD"].firstChild);
		head[y].Editor = undefined;
	};
	
	this.getSelRow = function()
	{
		return selshadow.getObj();
	};
	
	this.getsel = function ()
	{
		return selshadow;
	};
	
	this.getData = function ()
	{
		return data;
	};

	this.getHead = function ()
	{
		return head;
	};
	
	this.getBodyTable = function ()
	{
		return domobj.all.BodyTable;
	};
	
	this.outerDoc = function()
	{
		var tag = "<table cellpadding=3 cellspacing=0 border=0><tr>";
		for (var x = 0; x < head.length; x++)
		{
			if (head[x].nShowMode == 1)
				tag += "<td width=" + head[x].nWidth + "px>" + head[x].TitleName + "</td>";
		}
		return tag + "</tr>" + getbody(0) + "</table>";
	};
	
	this.selCol = function (index)
	{
		selshadow.hide();
		for (x = 0; x < domobj.all.BodyTable.rows.length; x++)
			selshadow.show(domobj.all.BodyTable.rows[x].cells[index], true);
	}

	this.deleteRow = function(row)
	{
		if (typeof row == "undefined")
		{
			var rows = selshadow.getShadow();
			for (var x = 0; x < rows.length; x++)
				this.deleteRow(rows[x].obj);
			return;
		}
		if (typeof row == "number")
			return this.deleteRow(this.getRow(row));
		if (row.tagName != "TR")
		 	return;
		data.splice(row.rowIndex, 1);
		row.removeNode(true);
	}
	
	this.insertRow = function (linedata)
	{
		var index = data.length;
		var rows = selshadow.getShadow();
		if (rows.length > 0)
		{
		 	if (rows[0].obj.tagName == "TR")
				index = rows[rows.length - 1].obj.rowIndex + 1;
		}
		if (index == data.length)
			data[index] = linedata;
		else
			data.splice(index, 0, linedata);
//		this.reload(data);
	}
	
	this.insertCol = function (headitem)
	{
		var index = data.length;
		var rows = selshadow.getShadow();
		if (rows.length > 0)
		{
		 	if (rows[0].obj.tagName == "TD")
				index = rows[rows.length - 1].obj.cellIndex + 1;
		}
		if (index == head.length)
			head[index] = headitem;
		else
			head.splice(index, 0, headitem);
	}
	
	this.waiting = function (s)
	{
		if (typeof s == "undefined")
			s = "载入中...";
		domobj.all.BodyDiv.innerHTML = s;		
	};

	this.getItemData = function(node)
	{
		if (typeof node == "undefined")
			node = this.getSelRow().node;
		if (typeof node == "number")
			return data[node];
		if (typeof node == "object")
			node = node.node;
		var ss = node.split(",");
		var item, items = data;
		for (var x = 0; x < ss.length; x++)
		{
			item = items[parseInt(ss[x])];
			items = item.child;
		}
		return item;		
	};

	this.expand = function(row, flag)
	{
		if (typeof row == "undefined")
		{
			var rows = selshadow.getShadow();
			for (var x = 0; x < rows.length; x++)
				this.expand(rows[x].obj, flag);
			return;
		}

		if (typeof row.all.BtExTree != "object")
			return;
		expandTreeLine(row.all.BtExTree, flag);
	};

	this.expandall = function (flag)
	{
		for (x = 0; x < domobj.all.BodyTable.rows.length; x++)
			self.expand(domobj.all.BodyTable.rows[x], flag);
	}

	function init()
	{
		switch (cfg.gridstyle)
		{
		case 1:
			createGrid();
			break;
		case 2:
			createTable();
		}
	}
	
	cfg = FormatObjvalue({gridstyle:1, headstyle:1, bodystyle:3, footstyle:1, 
			bodycolor:"black", bodybkcolor:"white", rollbkcolor: "#f8f8ff",selbkcolor:"#B7E3FE", 
			nowrap:1, rightmenu:null, initDepth:1, nIndent:20}, cfg);
	selshadow = new CommonShadow(0, cfg.selbkcolor);
	rollshadow = new CommonShadow(0, cfg.rollbkcolor);
	if (typeof data == "undefined")
		data = [];
	init();
}

function TreeView(domobj, data, cfg)
{
var self = this;
var expic = ["com/pic/minus.gif", "com/pic/plus.gif"];
var rollshadow, selshadow;

	function init()
	{
		var tag = "";
		for (var x = 0; x < data.length; x++)
			tag += getnodetag(data[x], 0, x);
		domobj.innerHTML = tag;
		domobj.onclick = mouseevent;
		domobj.ondblclick = mouseevent;
		domobj.onmouseover = mouseevent;

		domobj.oncontextmenu = mouseevent;
		selshadow = new CommonShadow(0, cfg.selbkcolor);
		rollshadow = new CommonShadow(0, cfg.rollbkcolor);
	}

	function getnodetag(item, depth, node)
	{
		var title = "";
		if (typeof item.title == "string")
			title = " title=\"" + item.title + "\"";
		var nowrap = "";
		if ((cfg.nowrap == 1) || (cfg.nowrap == true))
			nowrap = " nowrap";
		var style = "";
		if (typeof item.style == "string");
			style = item.style;
		var div = "<div node=" + node + " style=\"width:100%;padding:" + cfg.vpadding + "px 2px " + cfg.vpadding + "px " +
			(depth * cfg.nIndent) + "px;" + style + "\"" + title + nowrap + ">"; 
		var img = "";
		if (typeof item.img == "string")
			img = "&nbsp;<img src=" + item.img + " style=VERTICAL-ALIGN:middle>&nbsp;";
		var text = img + "<span>" + item.item + "</span>";
		if (typeof item.child != "object")
			return div + text + "</div>";
		var tag = "";
		if ((depth >= cfg.initDepth - 1) || (item.child == null))
			return div + "<img id=BtExTree src=" + expic[1] + " style=VERTICAL-ALIGN:middle>" + text + 
				"</div><div id=subdiv unloadflag=1 style=display:none;></div>";
		for (var x = 0; x < item.child.length; x++)
			tag += getnodetag(item.child[x], depth + 1, node + "," + x);
		return div + "<img id=BtExTree src=" + expic[0] + " style=VERTICAL-ALIGN:middle>" + text + 
				"</div><div id=subdiv>" + tag + "</div>";
	}

	function mouseevent()
	{
		var o = findparentnode(event.srcElement);
		if (typeof o == "undefined")
			return;
		switch (event.type)
		{
		case "dblclick":
			return self.dblclick(o);
		case "contextmenu":
			return self.contextmenu(o);
		case "click":
			if (event.srcElement.id == "BtExTree")
				return expand(event.srcElement);
			return self.click(o);
		case "mouseover":
			return self.mouseover(o);
		default:
			alert(event.type);
		}
	}

	function expand(img, flag)
	{
		var odiv = img.parentNode.nextSibling;
		if ((((flag == 1) || (flag == true)) && (odiv.style.display != "none"))
			|| (((flag == 0) || (flag == false)) && (odiv.style.display == "none")))
			return

		if (odiv.style.display == "none")
		{
			odiv.style.display = "block";
			img.src = expic[0];
			if (odiv.unloadflag == 1)
			{
				odiv.unloadflag = 2;
				var item = self.getTreeItem(img.parentNode.node);
				if (item.child == null)
				{
					odiv.innerHTML = "<span style=color:gray;>加载中...</span>";
					self.loadnode(item, odiv);
				}
				else
					self.loadnodeok(item, odiv);
			}
		}
		else
		{
			odiv.style.display = "none";
			img.src = expic[1];
		}
	}

	function findparentnode(obj)
	{
		for (var o = obj; o != domobj; o = o.parentNode)
		{
			if (obj == null)
				return;
			if (typeof o.node != "undefined")
				return o;
		}
	}

	this.click = function (obj)
	{
		this.select(obj);
	};

	this.expand = function (obj, flag)
	{
		if (typeof obj.all.BtExTree == "object")
			expand(obj.all.BtExTree, flag);
	};

	this.reloadNode = function (obj)
	{
		if (typeof obj == "undefined")
			obj = selshadow.getObj();
		obj.nextSibling.unloadflag = 1;
		self.expand(obj, false);
		self.expand(obj, true);
	};

	this.select = function (obj)
	{
		rollshadow.hide();
		selshadow.show(obj);
	};

	this.dblclick = function (obj)
	{
		this.expand(obj);
	};

	this.contextmenu = function (obj)
	{
	};

	this.mouseover = function (obj)
	{
		if (selshadow.isShadow(obj))
			rollshadow.hide();
		else
			rollshadow.show(obj);
	};

	this.getdata = function ()
	{
		return data;
	};
	
	this.getnode = function(key, value)
	{
		for (var x = 0; x < data.length; x++)
		{
			if (data[x][key] == value)
				return data[x];
		}
	};

	this.getTreeItem = function(node)
	{
		if (typeof node == "undefined")
			node = selshadow.getObj().node;
		if (typeof node == "object")
			node = node.node;
		if (typeof node == "number")
			return data[node];
		var ss = node.split(",");
		var item = data[parseInt(ss[0])];
		for (var x = 1; x < ss.length; x++)
			item = item.child[parseInt(ss[x])];
		return item;
	};
	
	this.setNodeText = function (node, text)
	{
		var item = getTreeItem(node);
		item.item = text;
	};
	
	this.getNodeObj = function(key, value)
	{
		var node = value;
		if ((typeof key == "string") && (key != ""))
			node = this.getItemNode(key, value);
		if (typeof node == "undefined")
			return;
		var objs = domobj.getElementsByTagName("DIV");
		for (var x = 0; x < objs.length; x++)
		{
			if (objs[x].node == node)
				return objs[x];
		}
	};
	
	this.getItemNode = function(key, value, treedata, initnode)
	{
		if (typeof treedata == "undefined")
			treedata = data;
		if (typeof initnode == "undefined")
			initnode = "";
		var node;
		for (var x = 0; x < treedata.length; x++)
		{
			if (initnode == "")
				node = initnode + x;
			else
				node = initnode + "," + x;
			if (value == treedata[x][key])
				return node;
			if (typeof treedata[x].child == "object")
			{
				node = this.getItemNode(key, value, treedata[x].child, node);
				if (typeof node != "undefined")
					return node;
			}
		}
	};

	this.setexpic = function(pic)
	{
		expic = pic;
		init();
	};


	this.setdata = function(d)
	{
		data = d;
		init();
	};

	this.getsel = function ()
	{
		return selshadow;
	};

	this.append = function(d)
	{
		var len = data.length;
		data.splice(len, 0, d);
		var tag = "";
		for (var x = len; x < data.length; x++)
			tag += getnodetag(data[x], 0, x);
		domobj.insertAdjacentHTML("beforeEnd", tag);
	};

	this.loadnode = function(item, odiv)
	{
		item.child = [];
		this.loadnodeok(item, odiv);
	};

	this.loadnodeok = function(item, odiv)
	{
		if (odiv.firstChild != null)
			odiv.firstChild.removeNode(true);
		var node = odiv.previousSibling.node;
		var ss = node.split(",");
		var tag = "";
		for (var x = 0; x < item.child.length; x++)
			tag += getnodetag(item.child[x], ss.length, node + "," + x);
		odiv.innerHTML = tag;
		odiv.removeAttribute("unloadflag");
	};

	this.attachEditor = function (editor)
	{
	};
	
	this.detachEditor = function ()
	{
	};

	this.count = function (item)
	{
		if (typeof item != "object")
			item = data;
		if (typeof item.length != "number")
		{
			if (typeof item.child == "object")
				return this.count(item.child) + 1;
			return 1;
		}
		var cnt = 0;
		for (var x = 0; x < item.length; x++)
		{
			if (typeof item[x].child == "object")
				cnt += this.count(item[x].child);
		}
		return cnt + item.length;
	};

	cfg = FormatObjvalue({bodycolor:"black", bodybkcolor:"white", rollbkcolor: "#f8f8ff",selbkcolor:"#B7E3FE", 
			nowrap:1, rightmenu:null,initDepth:3, nIndent:20,vpadding:1}, cfg);
	init();
}

function FormView(domobj, items, data, cfg)
{
	var self = this;
	var form;
	function init()
	{
		var tag = "<form action=" + cfg.action + " method=POST name=ActionSave>" +
			"<table border=0 cellpadding=3 cellspacing=1 class=jformtable" + cfg.css + ">";
		if (cfg.title != "")
			tag += "<tr><td colspan=" + cfg.nStyle * cfg.nCols + " class=jformtitle" + cfg.css + ">" + cfg.title + "</td></tr><tr>";
		var htag = "";
		var rows = 1, cols = 0;
		for ( var x = 0; x < items.length; x++)
		{
			items[x] = FormatObjvalue({CName:"", EName:"", nShow:1, nReadOnly:0, nRequired: 0, InputType: 1, 
				DftValue:"", Relation:"", Quote:"", nCol:1, nRow:1, nWidth:1, nHeight:1, Hint:""},  items[x]);
			getquote(items[x]);
			cols += items[x].nWidth;
			if ((rows < items[x].nRow) || (cols > cfg.nCols))
			{
				tag += "</tr><tr>";
				rows = items[x].nRow;
				cols = items[x].nWidth;
			}
			var required = "";
			if (items[x].nRequired == 1)
				required = "<span style=color:red>*</span>";
			var objtag = "";
			if ((items[x].nWidth == 0) || (items[x].InputType == 21))
				htag += "<input type=hidden name=" + items[x].EName + ">";
			else
				objtag = getobj(items[x]);
			switch (cfg.nStyle)
			{
			case 1:
				tag += "<td colspan=" + items[x].nWidth + ">" + items[x].CName + required + "<br>" + objtag + "</td>";
				break;
			case 2:
				tag += "<td>" + items[x].CName + required + "</td><td colspan=" + (items[x].nWidth * 2 - 1) + ">" + objtag + "</td>";
				break;
			case 3:
				tag += "<td nowrap>" + items[x].CName + required + "</td><td width=40% colspan=" + (items[x].nWidth * 3 - 2) + ">" + objtag + 
					"</td><td style=width:30%;color:gray;>" + items[x].Hint + "</td>";
				break;
			}
		}
		tag += "</tr></table>" + htag + getbar() + "</form>";
		domobj.innerHTML = tag;
		for ( var x = 0; x < items.length; x++)
		{
			switch (items[x].InputType)
			{
			case 3:		//单选框
				break;
			case 4:		//下拉框
				break;
			case 7:		//超文本框
				items[x].obj = new HTMLEditor(domobj.all[items[x].EName + "_DIV"], {});
				break;
			}
		}
		self.setdata(data);
		form = domobj.firstChild;
		form.onkeydown = keydown;
		form.onclick = click;
		form.ondblclick = dblclick;
		form.onsubmit = beforesubmit;
	}

	function getobj(item)
	{
		var tag = "";
		var readonly = "";
		if (item.nReadOnly == 1)
			readonly = " readonly";
		switch (item.InputType)
		{
		case 1:		//编辑框
			tag = "<input type=text name=" + item.EName + readonly + " style=width:100%>";
			break;
		case 2:		//检查框
			tag = "<input type=checkbox name=" + item.EName + readonly + ">";
			break;
		case 3:		//单选框
			if ((typeof item.data == "undefined") || (item.data == ""))
				tag = "<div id=" + item.EName + "_DIV style=width:100%;height:" + item.nHeight * 30 + "px;></div>";
			else
			{
				var ss = item.data.split(",");
				for (var y = 0; y < ss.length; y++)
				{
					var sss = ss[y].split(":");
					tag += "<input type=radio name=" + item.EName + " value=" + sss[0] + readonly + ">" + sss[1] + "&nbsp;";
				}
			}
			break;
		case 4:		//下拉框
			tag = "<select name=" + item.EName + ">";
			if ((typeof item.data == "string") && (item.data != ""))
			{
				var ss = item.data.split(",");
				for (var y = 0; y < ss.length; y++)
				{
					var sss = ss[y].split(":");
					tag += "<option value=" + sss[0] + ">" + sss[1] + "</option>";
				}
			}
			tag += "</select>";
			break;
		case 5:		//文本框
			tag = "<textarea style=width:100%; name=" + item.EName + " rows=" + item.nHeight + readonly + "></textarea>";
			break;
		case 6:		//密码框
			tag = "<input type=password name=" + item.EName + readonly + ">";
			break;
		case 7:		//超文本框
			tag = "<div id=" + item.EName + "_DIV style='overflow:hidden;width:100%;height:" + item.nHeight * 30 + "'></div>";
			break;
		case 8:		//自定义类型
		case 9:		//组合框
		case 10:	//表格
		case 11:	//分栏
		case 12:	//分页
		case 13:	//表单
		case 14:	//视图
		case 15:	//图片
		case 16:	//页面
		case 17:	//明细表
		case 22:	//OFFICE文档
		case 13:	//文件框
		case 24:	//预定义
			break;
		case 21:	//隐藏框
			break;
		}
		return tag;
	}

	function getbar()
	{
		var tag = "<div id=FormButtonDiv align=center class=jformtail" + cfg.css + ">";
		switch (cfg.nType)
		{
		case 1:		//查看
			break;
		case 2:		//修改
			tag += "<input type=submit value='提 交' name=SubmitButton>&nbsp;";
			break;
		case 3:		//打印
			break;
		case 4:		//自定义
			break;
		case 5:		//浏览
			break;
		case 6:		//编辑
			break;
		case 7:		//查询
			break;
		}
		return tag + "</div>";
	}

	function keydown()
	{
//		alert("KEYDOWN");
	}

	function click()
	{
//		alert("click");
	}

	function dblclick()
	{
		alert("dblclick");
	} 

	function getquote(item)
	{
		switch (item.Quote.substr(0, 1))
		{
		case "(":
			item.data = item.Quote.substr(1, item.Quote.length - 2);
			break;
		case "$":
			break;
		case "@":
			break;
		default:
			break;
		}

	}

	function beforesubmit()
	{
		var result = true;
		for ( var x = 0; x < items.length; x++)
		{
			if (items[x].nRequired == 1)
			{
				if (form.all[items[x].EName].value == "")
				{
					result = false;
					form.all[items[x].EName].style.border = "1px solid red";
//					alert(items[x].CName + "必填");
				}
			}
		}
		if (result)
			return self.submit();
		return false;
	}
	this.keypress = function (key)
	{
	};

	this.onchange = function(obj)
	{
	};

	this.submit = function ()
	{
		return true;
	};

	this.attachEvent = function(item, evt, fun)
	{
	};

	this.detachEvent = function(item, evt, fun)
	{
	};

	this.setdata = function (d)
	{
		data = d;
	};

	cfg = FormatObjvalue({title:"", action:"", nType:2, nStyle:3,nCols:1,headTxt: "", footTxt: "", width:0,height:0,viewpage:"", css:"1"}, cfg);
	init();
}

function HTMLEditor(domobj, cfg)
{
	var self = this;
	var tool, ruler, doc;
	var cb, bb, pb, menudef, propwin;

	function getRngObj(obj, tag)
	{
		obj.focus();
		var target = null, item;
		var ttype = doc.selection.type;
		var selrange = doc.selection.createRange();
		
		switch(ttype)
		{
		case 'Control' :
			if (selrange.length > 0 ) 
				target = selrange.item(0);
			break;
		case 'None' :
			target = selrange.parentElement();
			break;
		case 'Text' :
			target = selrange.parentElement();
			break;
		}
	
		if ((tag == "") || (tag == undefined))
			return target;
		for (item = target; (item != null) && (item != obj); item = item.parentElement)
		{
			if (item.tagName == tag)
				return item;
		}
		return null;
	}

	function execCommand(obj, item)
	{
		doc.execCommand(item.cmd);
		SetStatus();
	}

	function EditorMenu()
	{
	}

	function KeyFilter()
	{
	}

	function SetStatus()
	{
		var value = doc.queryCommandValue("ForeColor");
		cb.firstChild.style.backgroundColor = rgb(value);
		value = doc.queryCommandValue("BackColor");
		bb.firstChild.style.backgroundColor = rgb(value);
		value = doc.queryCommandValue("FormatBlock");
		var o = domobj.all.psel;
		for (var x = 0; x < o.options.length; x++)
		{
			if (o.options[x].innerText == value)
			{
				o.value = o.options[x].value;
				break;
			}
		}
		value = doc.queryCommandValue("FontName");
		o = domobj.all.fsel;
		for (var x = 0; x < o.options.length; x++)
		{
			if (o.options[x].innerText == value)
			{
				o.selectedIndex = x;
				break;
			}
		}
		value = getRngObj(doc.body).currentStyle.fontSize;
		o = domobj.all.ssel;
		for (var x = 0; x < o.options.length; x++)
		{
			if (o.options[x].innerText == value)
			{
				o.selectedIndex = x;
				break;
			}
		}
		if (x == o.options.length)
			o.value = "";
		for (var x = 12; x < 21; x++)
		{
			value = doc.queryCommandValue(menudef[x].cmd);
			o = tool.getDomItem(menudef[x]);
			o.style.backgroundColor = value ? "#d0d0d0" : "";
		}
		if ((typeof propwin == "object") && (propwin.closed == false))
		{
			pb.style.backgroundColor = "#d0d0d0";
			doc.body.focus();
			o = getRngObj(doc.body, "");
			propwin.InitObject(o);
		}
		else
			pb.style.backgroundColor = "";
	}

	function rgb(color)
	{
		if (color == null)
			color = 0;
		var c = "00000" + color.toString(16);
		c = c.substr(c.length - 6);
		return "#" + c.substr(4, 2) + c.substr(2, 2) + c.substr(0, 2);
	}

	function prop()
	{
		if ((typeof propwin == "object") && (propwin.closed == false))
			return;
		propwin = window.showModelessDialog("/HTMLProp.htm", getRngObj(doc.body, ""),
			"dialogWidth:320px;dialogHeight:400px;status:0;scroll:0;help:0");
	}

	function setcolor(obj, item)
	{
		var color = SelectColor(0);
		doc.body.focus();
		if (typeof(color) != "string")
			return;
		doc.execCommand(item.cmd, false, color);
		obj.firstChild.style.backgroundColor = color;
	}

	function insertTable()
	{
		var tag = showModalDialog("/HTMLtable.htm", window, "dialogWidth:22em; dialogHeight:18em; status:0;scroll:no;");
		doc.body.focus();
		if (typeof(tag) == "string")
		{
	 		var oRange = document.selection.createRange();
			oRange.pasteHTML(tag);
		}
	}

	function insertRow()
	{
		var tab = getRngObj(doc.body, "TABLE");
		if (tab == null)
			return;
		var row = tab.insertRow();
		for (var x = 0; x < tab.rows[0].cells.length; x++)
		{
			var cell = row.insertCell();
			cell.bgColor = tab.rows[0].cells[x].bgColor;
		}
	}

	function deleteRow()
	{
		var tr = getRngObj(doc.body, "TR");
		if (tr != null)
			tr.removeNode(true);
	}

	function insertCol()
	{
		var tab = getRngObj(doc.body, "TABLE");
		if (tab == null)
			return;
		for (var x = 0; x < tab.rows.length; x++)
		{
			var cell = tab.rows[x].insertCell();
			cell.bgColor = tab.rows[x].cells[0].bgColor;
		}
	}

	function deleteCol()
	{
		var td = getRngObj(doc.body, "TD");
		if (td == null)
			return;
		var tab = td.parentNode.parentNode.parentNode;
		var pos = td.cellIndex;
		for(var x = 0; x < tab.rows.length; x++)
			tab.rows[x].cells[pos].removeNode(true);
	}

	function insertCell()
	{
		var td = getRngObj(doc.body, "TD");
		if (td == null)
			return;
		var cell = td.parentNode.insertCell();
		cell.bgColor = td.bgColor;
	}

	function deleteCell()
	{
		var td = getRngObj(doc.body, "TD");
		if (td != null)
			td.removeNode(true);
	}

	function exCell(obj, item)
	{
		var td = getRngObj(doc.body, "TD");
		if (td == null)
			return;
		if (item.cmd == 1)
			td.colSpan += 1;
		if (item.cmd == 2)
			td.rowSpan += 1;
	}

	function insertImg()
	{
		var tag = showModalDialog("/SelectImg.htm", doc, "dialogWidth:480px; dialogHeight:220px; status:0;scroll:no;");
		doc.body.focus();
		if (typeof tag != "string")
			return;
	 	var oRange = doc.selection.createRange();
		oRange.pasteHTML(tag);
	}

	function preview()
	{
		var win = new PopupWin("<iframe id=pview frameborder=0 style=width:100%;height:100%></iframe>",{title:"页面预览",width:500,height:400,mask:30});
		document.all.pview.contentWindow.document.write(doc.getElementsByTagName("HTML")[0].outerHTML);
	}

	function viewsource()
	{
		var win = new PopupWin("<div style='width:100%;height:100%;padding-bottom:30px;'><textarea id=hsrc style=width:100%;height:100%;>" +
			"</textarea></div><div align=right style=position:relative;top:-28px><input id=runsrc type=button value=应用>&nbsp;</div>",
			{title:"HTML代码",width:500,height:400,mask:30});
		document.all.hsrc.value = doc.getElementsByTagName("HTML")[0].outerHTML;
		win.show(-1, -1, 640, 480);
		document.all.runsrc.onclick = applysrc;
	}

	function applysrc()
	{
		doc.write(document.all.hsrc.value);
		doc.close();
	}

	function formatblock()
	{
		doc.body.focus();
		doc.execCommand("FormatBlock", false, "<" + event.srcElement.value + ">");
	}

	function selfont()
	{
		doc.body.focus();
		doc.execCommand("FontName", false, event.srcElement.options[event.srcElement.selectedIndex].innerText);
	}

	function selsize()
	{
		doc.body.focus();
	 	var oRange = doc.selection.createRange();
		if (oRange.boundingWidth > 0)
		{
			doc.execCommand("FontName", false, "eWebEditor_Temp_FontName");
			var fs = doc.getElementsByTagName("FONT");
			for (var x = 0; x < fs.length; x++)
			{
				if (fs[x].face == "eWebEditor_Temp_FontName")
				{
					fs[x].removeAttribute("face");
					fs[x].style.fontSize = event.srcElement.options[event.srcElement.selectedIndex].innerText;
				}
			}
			return;
		}
		var tag = "<span id=TEMPSPAN style=width:8px;font-size:" + event.srcElement.options[event.srcElement.selectedIndex].innerText + "></span>";
		var mark = oRange.getBookmark();
		var x = oRange.move("character", 1);
		if (x > 0)
		{
			oRange.moveToBookmark(mark);
			oRange.pasteHTML(tag);
		}
		else
		{
			var o = oRange.parentElement();
			if (o.currentStyle.display == "block")
				oRange.pasteHTML(tag);
			else
				o.insertAdjacentHTML("afterEnd", tag);
		}
		oRange.moveToElementText(doc.all.TEMPSPAN);
		doc.all.TEMPSPAN.style.width = "";
		doc.all.TEMPSPAN.removeAttribute("id");
		oRange.select();
	}

	function Init()
	{
		var text = domobj.innerHTML;
		if (cfg.EName == "")
			cfg.EName = domobj.id;
		domobj.innerHTML = "<div style='width:100%;height:28px;border:1px solid gray;overflow:hidden;background-color:" + cfg.toolbkcolor + "'></div>" +
			"<div style='width:100%;height:100%;padding-bottom:28px;overflow:hidden;'>" +
			"<iframe id=HTMLEditFrame STYLE='height:100%;width:100%;border-left:1px solid gray;border-right:1px solid gray;border-bottom:1px solid gray;' frameborder=0></iframe></div>" +
			"<textarea style=border:0;width:100%;height:100%;display:none; name=" + cfg.EName + "></textarea>";
//			"<div style='width:100%;height:26px;background-color:" + cfg.footbkcolor + "'></div>";
		menudef = [{title:"查看", img:"/pic/tasks16.gif", child:[
				{item:"页面预览", action:preview}, {item:"查看HTML源代码", action:viewsource}
			]}, {}, 
			{title:"剪切", cmd:"Cut", img:"/pic/cut.gif", action:execCommand},
			{title:"复制", cmd:"Copy", img:"/pic/copy.gif", action:execCommand},
			{title:"粘贴", cmd:"Paste", img:"/pic/paste.gif", action:execCommand}, {},
			"<select id=psel align=middle style=width:54px><option value=P>普通</option>" +
				"<option value=H1>标题 1</option><option value=H2>标题 2</option><option value=H3>标题 3</option>" +
				"<option value=H4>标题 4</option><option value=H5>标题 5</option><option value=H6>标题 6</option>" +
				"<option value=PRE>已编排格式</option><option value=ADDRESS>地址</option></select>", 
			"<select id=fsel align=middle style=width:54px><option value=宋体>宋体</option>" +
				"<option>仿宋</option><option>黑体</option><option>楷体</option><option>隶书</option><option>幼圆</option>" +
				"<option>新宋体</option><option>微软雅黑</option><option>细明体</option>" +
				"<option>Arial</option><option>Arial Black</option><option>Arial Narrow</option>" +
				"<option>Bradley Hand ITC</option><option>Brush Script MT</option><option>Century Gothic</option>" +
				"<option>Comic Sans MS</option><option>Courier</option><option>MS Sans Serif</option>" +
				"<option>Script</option><option>System</option><option>Times New Roman</option>" +
				"<option>Viner Hand ITC</option><option>Verdana</option><option>Wide Latin</option><option>Wingdings</option></select>", 
			"<select id=ssel align=middle style=width:44px><option>9px</option><option>10px</option><option>11px</option>" +
				"<option>12px</option><option>13px</option><option>14px</option><option>15px</option>" +
				"<option>16px</option><option>18px</option><option>20px</option><option>22px</option>" +
				"<option>24px</option><option>26px</option><option>28px</option><option>36px</option>" +
				"<option>48px</option><option>72px</option></select>", 
			{title:"字体颜色", cmd:"ForeColor", img:"/pic/fgcolor1.gif", action:setcolor},
			{title:"背景颜色", cmd:"BackColor", img:"/pic/fbcolor1.gif", action:setcolor},{}, 
			{title:"粗体", cmd:"Bold", img:"/pic/bold.gif", action:execCommand}, 
			{title:"斜体", cmd:"Italic", img:"/pic/Italic.gif", action:execCommand},
			{title:"下划线", cmd:"Underline", img:"/pic/Under.gif", action:execCommand},
			{title:"删除线", cmd:"StrikeThrough", img:"/pic/strike.gif", action:execCommand}, 
			{title:"左对齐", cmd:"JustifyLeft", img:"/pic/aleft.gif", action:execCommand}, 
			{title:"居中", cmd:"JustifyCenter", img:"/pic/Center.gif", action:execCommand},
			{title:"右对齐", cmd:"JustifyRight", img:"/pic/aright.gif", action:execCommand},
			{title:"项目符号", cmd:"InsertUnorderedList", img:"/pic/bullist.gif", action:execCommand}, 
			{title:"数字编号", cmd:"InsertOrderedList", img:"/pic/numlist.gif", action:execCommand}, {},
			{title:"属性", img:"/pic/Property.gif", action:prop},
			{title:"表格", img:"/pic/tablesel.gif", child:[
				{item:"插入表格", img:"/pic/table.gif", action:insertTable},
				{item:"插入行", img:"/pic/insrow.gif", action:insertRow},
				{item:"删除行", img:"/pic/delrow.gif", action:deleteRow},
				{item:"插入列", img:"/pic/inscol.gif", action:insertCol},
				{item:"删除列", img:"/pic/delcol.gif", action:deleteCol},
				{item:"插入单元格", img:"/pic/inscell.gif", action:insertCell},
				{item:"删除单元格", img:"/pic/delcell.gif", action:deleteCell},
				{item:"横扩单元格", cmd:1, img:"/pic/excellh.gif", action:exCell},
				{item:"纵扩单元格", cmd:2, img:"/pic/excellv.gif", action:exCell}]},
			{title:"插入链接", cmd:"CreateLink", img:"/pic/Link.gif", action:execCommand},
			{title:"插入图片", img:"/pic/image.gif", action:insertImg}];
		tool = new CommonMenubar(menudef, domobj.firstChild);
		doc = domobj.all.HTMLEditFrame.contentWindow.document;
		domobj.all.psel.onchange = formatblock;
		domobj.all.fsel.onchange = selfont;
		domobj.all.ssel.onchange = selsize;
		if (text == "")
			text = "<p>&nbsp;</p>";
		doc.write("<HTML><head><link rel='stylesheet' type='text/css' href='/forum_java.css'></head><BODY style=margin:0px;>" + text + "</BODY><HTML>");
		domobj.lastChild.value = text;
		doc.designMode = "on";
		doc.oncontextmenu = EditorMenu;
		doc.onmouseup = SetStatus;
//		doc.onkeydown = KeyFilter;
		doc.onkeyup = SetStatus;
		cb = tool.getDomItem("字体颜色");
		bb = tool.getDomItem("背景颜色");
		pb = tool.getDomItem("属性");
	}

	cfg = FormatObjvalue({EName:"",toolbkcolor:"#eeeeee", footbkcolor:"#eeeeee"}, cfg);
	Init();
	
	this.copydata = function()
	{
		domobj.all[cfg.EName].value = doc.getElementsByTagName("HTML")[0].outerHTML;
	};

	this.gettool = function ()
	{
		return tool;
	};
}

//动态编辑框类集合
var DynaEditor = {};
//基类,实现一个有下拉箭头的编辑框,点击弹出下拉内容,具体内容由派生类实现.
DynaEditor.Base = function(width, height)
{
	var self = this;
	self.oHost = undefined;
	self.oEdit = undefined;
	self.oBox = undefined;
	self.bAutoPop = true;
	self.value = "";
	self.bLastValue = true;
	this.attach = function(obj, flag)
	{
		if (flag || (flag == 1))
			return obj.attachEvent("onmousedown", this.show);
		obj.attachEvent("onfocus", this.show);
	};

	this.detach = function(obj, flag)
	{
		if (flag || (flag == 1))
			return obj.detachEvent("onmousedown", this.show);
		obj.detachEvent("onfocus", this.show);
	};

	this.insert = function(obj, sWhere, width, height, value)
	{
		this.create();
		obj.insertAdjacentElement(sWhere, self.oEdit);
		self.oEdit.style.position = "static";
		self.oEdit.style.display = "inline";
		if (typeof width != "undefined")
			self.oEdit.style.width = width;
		if (typeof height != "undefined")
			self.oEdit.style.height = height;
		if (typeof value != "undefined")
		{
			self.value = value;
			self.oEdit.firstChild.value = value;
			self.oEdit.firstChild.select();
			self.oEdit.firstChild.focus();
		}
	};
	
	this.remove = function ()
	{
		self.oEdit.removeNode();
	};
	
	this.create = function()
	{
		self.oEdit = document.createElement("SPAN");
		self.oEdit.style.position = "absolute";
		self.oEdit.style.overflow = "hidden";
		self.oEdit.style.display = "none";
		self.oEdit.style.border = "1px solid gray";
		self.oEdit.innerHTML = "<input type=text style='overflow:hidden;border:none;width:100%;height:100%;margin:0 13px 0 0'>" +
			"<span unselectable=on style='background-color:white;cursor:default;font-family:webdings;vertical-align:top;margin-left:-13px;width:13px;height:100%;overflow:hidden'>" +
			"<span unselectable=on style=position:relative;top:-6px;>6</span></span>";
		document.body.insertAdjacentElement("beforeEnd", self.oEdit);
		self.oEdit.firstChild.onchange = self.onChange;
		self.oEdit.firstChild.onblur = self.hide;
		self.oEdit.firstChild.onkeydown = self.keydown;
		self.oEdit.lastChild.onmouseover = OverButton;
		self.oEdit.lastChild.onmouseout = OutButton;
		self.oEdit.lastChild.onmousedown = self.popDown;
	};
	
	this.show = function()
	{
		self.oHost = event.srcElement;
		var pos = GetObjPos(self.oHost);
		if (typeof self.oEdit == "undefined")
			self.create();
		self.oEdit.style.display = "";
		self.oEdit.style.width = pos.right - pos.left + 2;
		self.oEdit.style.height = pos.bottom - pos.top + 2;
		self.oEdit.style.left = pos.left;
		self.oEdit.style.top = pos.top - 1;

		self.oHost.style.visibility = "hidden";
		self.oEdit.firstChild.value = self.getHostValue();
		self.onshow();
		if (self.bAutoPop)
			self.popDown();
		self.oEdit.firstChild.select();
		self.oEdit.firstChild.focus();
	};
	
	this.onshow = function ()
	{
		if (self.bLastValue && (Trim(self.oEdit.firstChild.value) == "") && (self.value != ""))
			self.setValue(self.value);
	};
	
	this.getHostValue = function ()
	{
		if (self.oHost.tagName == "INPUT")
			return self.oHost.value;
		return self.oHost.innerText;
	}

	this.hide = function()
	{
		if (typeof self.oHost == "object")
		{
			self.oHost.style.visibility = "visible";
			self.oEdit.style.display = "none";
		}
		if (typeof self.oBox == "object")
			self.oBox.hide();
		self.blur(self.oHost);
	};
	
	this.blur = function (oHost) {};
	
	this.onChange = function()
	{
		self.value = self.oEdit.firstChild.value;
		if (typeof self.oHost == "object")
		{
			if (self.oHost.tagName == "INPUT")
				self.oHost.value = self.oEdit.firstChild.value;
			else
				self.oHost.innerText = self.oEdit.firstChild.value;
			if ((self.oHost.tagName == "INPUT") || (self.oHost.tagName == "TEXTAREA"))
				self.oHost.fireEvent("onchange");
		}
		self.valueChange(self.oHost);
	}

	this.valueChange = function (oHost) {};
	
	this.setValue = function(value)
	{
//		if (self.oEdit.firstChild.value == value)
//			return;
		self.value = value;
		self.oEdit.firstChild.value = value;
		self.oEdit.firstChild.fireEvent("onchange");
	};
	
	this.getValue = function ()
	{
		return self.value;
	};
	
	this.confirm = function(value)
	{
		self.setValue(value);
		self.hide();
	};
	
	this.createPop = function()
	{
		var tag = "<div style='border:1px solid gray;width:" + self.width  + ";height:" + self.height + "'></div>";
		self.oBox.setPopObj(tag);
		
	};
	
	this.onpop = function()	{};
	
	function OverButton()
	{
		self.oEdit.lastChild.style.borderLeft = "1px solid gray";
		self.oEdit.lastChild.style.filter = "progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr='#f6faff', EndColorStr='#86dffe')";
	}
	
	function OutButton()
	{
		self.oEdit.lastChild.style.borderLeft = "1px solid transparent";
		self.oEdit.lastChild.style.filter = "";
	}

	this.popDown = function()
	{
		self.width = width, 
		self.height = height;
		var pos = GetObjPos(self.oEdit);
		if ((self.width == 0) || (typeof self.height == "undefined"))
			self.width = pos.right - pos.left;
		if ((self.height == 0) || (typeof self.height == "undefined"))
			self.height = 200;

		if (typeof self.oBox == "undefined")
		{
			self.oBox = new PopupBox("", pos.left, pos.top, pos.left, pos.bottom - 1);
			self.createPop();
			self.oBox.hide();
		}
		if (self.oBox.isShow())
			self.oBox.hide();
		else
		{
			self.onpop();
			self.oBox.show(pos.left, pos.top, pos.left, pos.bottom - 1);
		}
	};
	
	this.hidePop = function ()
	{
		if (typeof self.oBox == "object")
			self.oBox.hide();
	};
	this.keydown = function (){};
	
	this.keydownHost = function (){};
};

//动态日期编辑框,继承自DynaEditor.Base
DynaEditor.Date = function (width, height)
{
	var self = this;
	var calendar;
	DynaEditor.Base.call(this, width, height);
	
	this.createPop = function ()
	{
		var obj = self.oBox.getdomobj();
		calendar = new CalendarBase(0, obj);
		obj.className = "CanlendarDiv";
		obj.style.border = "1px solid gray";
		obj.style.filter = "progid:DXImageTransform.Microsoft.Shadow(direction=135,strength=2,color=gray)";
		obj.style.width = self.width;
		obj.style.height = self.height;
		calendar.clickDate = this.confirm;
		calendar.onReady = DateReady;
	};
		
	this.onpop = function ()
	{
		calendar.show(self.oEdit.firstChild.value);
		var d = calendar.getDate();
		self.oEdit.firstChild.value = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
		calendar.selDateCell(d);
	};

	function DateReady()
	{
		self.oBox.unselect();
	}
};

//动态列表编辑框,继承自DynaEditor.Base
DynaEditor.List = function(data, width, height)
{
	var self = this;
	DynaEditor.Base.call(this, width, height);
	var shadow = new CommonShadow(1, "SelectObj");
		
	this.createPop = function ()
	{
		var tag = "";
		if (typeof data == "string")
		{
			var ss = data.split(",");
			for (var x = 0; x < ss.length; x++)
				tag += "<div nowrap unselectable=on style=cursor:default;width:100%;height:20px;padding-left:4px>" + ss[x] + "</div>";
		}
		self.oBox.setPopObj(tag);
		var div = self.oBox.getdomobj();
		div.style.border = "1px solid gray";
		div.style.filter = "progid:DXImageTransform.Microsoft.Shadow(direction=135,strength=2,color=gray)";
		div.style.overflowY = "auto";
		div.style.overflowX = "hidden";
		
		div.onclick = function ()
		{
			if (event.srcElement != div)
				self.confirm(event.srcElement.innerText);
		};
		div.onmouseover = function()
		{
			var obj = event.srcElement;
			if (obj.tagName != "DIV")
				obj = obj.parentNode;
			if (obj != div)
				 shadow.show(obj);
		};
	};
	
	this.onpop = function()
	{
		var div = self.oBox.getdomobj();
		div.style.width = self.width;
		if ((typeof(self.height) != "undefined") && (div.clientHeight > self.height))
			div.style.height = self.height;
	};
	
	this.setData = function (d)
	{
		data = d;
		if (typeof self.oBox == "object")
		{
			shadow.hide();
			self.oBox.remove();
			self.oBox = undefined;
		}
		self.value = "";
	};
	
	this.getData = function ()
	{
		return data;
	};
	
	this.keydown = function ()
	{
		var sel = shadow.getObj();
		switch (event.keyCode)
		{
		case 40:		//down
			if (typeof sel == "object")
				sel = sel.nextSibling;
			break;
		case 38:		//up
			if (typeof sel == "object")
				sel = sel.previousSibling;
			break;
		case 13:	//enter
			self.confirm(self.oEdit.firstChild.value);
		default:
			return;
		}
		if (typeof self.oBox != "object")
			return;
		var div = self.oBox.getdomobj();
		if (typeof sel == "undefined")
			sel = div.firstChild;
		else if (sel == null)
			return;
		shadow.show(sel);
		sel.scrollIntoView(false);
//		self.setValue(sel.innerText);
		self.value = sel.innerText;
		self.oEdit.firstChild.value = sel.innerText;
	};
};

DynaEditor.TreeList = function(data, width, height)
{
	var self = this;
	DynaEditor.Base.call(this, width, height);
	var expic, tree;
	
	function ClickTree(obj)
	{
		tree.select(obj);
		var item = tree.getTreeItem();
		self.confirm(item.item);
	}
	
	this.createPop = function ()
	{
		var tag = "<div style='border:1px solid gray;width:" + self.width  + ";height:" + self.height + "'></div>";
		self.oBox.setPopObj(tag);
		var domObj = self.oBox.getdomobj();
		tree = new TreeView(domObj.firstChild, data);
		if (typeof expic != "undefined")
			tree.setexpic(expic);
		tree.click = ClickTree;
	};
	
	this.setexpic = function(pic)
	{
		expic = pic;
	};
	
	
}

//动态编辑框,继承自DynaEditor.Base,也是选择框,文本框等对象的基类
DynaEditor.Input = function(width, height)
{
	var self = this;
	DynaEditor.Base.call(this);
	this.create = function()
	{
		var tag = self.createTag();
		if (typeof tag == "string")
		{
			self.oEdit = document.createElement("SPAN");
			self.oEdit.style.position = "absolute";
			self.oEdit.innerHTML = tag;
		}	
		if (typeof tag == "object")
			self.oEdit = tag;
		document.body.insertAdjacentElement("beforeEnd", self.oEdit);
		self.oEdit.firstChild.onchange = self.onChange;
		self.oEdit.firstChild.onblur = self.hide;
		self.oEdit.onkeydown = keydown;
	};
	this.show = function()
	{
		self.oHost = event.srcElement;
		if (typeof self.oEdit == "undefined")
			self.create();
		var pos = GetObjPos(self.oHost);
		if ((width == undefined) || (width == 0))
			self.oEdit.style.width = pos.right - pos.left + 2;
		else
			self.oEdit.style.width = width;
		if ((height == undefined) || (height == 0))
			self.oEdit.style.height = pos.bottom - pos.top + 2;
		else
			self.oEdit.style.height = height;
		self.oEdit.style.left = pos.left - 1;
		self.oEdit.style.top = pos.top - 1;
		self.oEdit.style.display = "inline";
		self.oEdit.firstChild.value = self.getHostValue();
		self.oHost.style.visibility = "hidden";
		self.onshow();
		self.oEdit.firstChild.focus();
	};
	this.createTag = function ()
	{
		return "<input type=text style='width:100%;height:100%;'>";
	};
	
	function keydown()
	{
	}
};

//动态文本框,继承自DynaEditor.Input
DynaEditor.Text = function(width, height)
{
	var self = this;
	DynaEditor.Input.call(this, width, height);
	this.createTag = function()
	{
		self.bLastValue = false;
		return "<textarea style='width:100%;height:100%;'></textarea>";
	};
};

//动态选择框,继承自DynaEditor.Input
DynaEditor.Select = function(data)
{
	var self = this;
	DynaEditor.Input.call(this);
	this.createTag = function()
	{
		var tag = "";
		if (typeof data == "string")
		{
			var ss = data.split(",");
			for (var x = 0; x < ss.length; x++)
				tag += "<option value=" + ss[x] + ">" + ss[x] + "</option>";
		}
		return "<select style='width:100%;height:100%;padding:1px'>" + tag + "</select>";
	};
};

//动态组合框,继承自DynaEditor.Select
DynaEditor.Combo = function(data)
{
	var self = this;
	DynaEditor.Select.call(this, data);
	function selchange()
	{
		self.setValue(self.oEdit.lastChild.value);
	}
	var _createTag = this.createTag;
	this.createTag = function()
	{
		var tag =_createTag();
		tag = "<input type=text style='border:1px solid #cccccc;padding-left:2px;" +
			"overflow:border-right:none;hidden;width:100%;height:20px;margin:-1 15px 0 1'>" + tag;
		var oEdit = document.createElement("div");
		oEdit.style.position = "absolute";
		oEdit.innerHTML = tag;
		oEdit.lastChild.style.position = "absolute";
		oEdit.lastChild.style.left = "0px";
		oEdit.lastChild.onchange = selchange;
		oEdit.lastChild.UNSELECTABLE = "on";
		return oEdit;
	};
	var _onshow = this.onshow;
	this.onshow = function ()
	{
		self.oEdit.lastChild.style.clip = "rect(0," + self.oEdit.clientWidth + "," +
			self.oEdit.clientHeight + "," + (self.oEdit.clientWidth - 18) + ")";
		_onshow();
		self.oEdit.lastChild.value = self.oEdit.firstChild.value;
	};
};

//动态增量框,继承自DynaEditor.Input
DynaEditor.Spin = function (minvalue, maxvalue, stepvalue)
{
	var self = this;
	var t = new Date();
	DynaEditor.Input.call(this, 0, 0);
	var _create = this.create;
	this.create = function()
	{
		_create();
		this.oEdit.lastChild.onscroll = run;
		this.oEdit.lastChild.scrollTop = 50;
	};

	function run()
	{
		var t1 = new Date();
		if (t1.getTime() - t.getTime() < 180)
			return;
		t = t1;
		var cfp = self.oEdit.lastChild.componentFromPoint(event.clientX, event.clientY);
		switch (cfp)
		{
		case "scrollbarDown":
			self.setValue(self.cal(self.oEdit.firstChild.value, 1));
			break;
		case "scrollbarUp":
			self.setValue(self.cal(self.oEdit.firstChild.value, -1));
			break;
		}
		self.oEdit.lastChild.scrollTop = 50;
	}
	
	this.cal = function(value, step)
	{
		var result = parseInt(value) + stepvalue * step;
		if (result > maxvalue)
			result = maxvalue;
		if (result < minvalue)
			result = minvalue;
		 return result;
	}

	this.createTag = function()
	{
		return "<input type=text style='width:100%;height:18px;position:absolute;border:none;border-right:20px solid transparent;top:1px;left:1px;'>" +
			"<div UNSELECTABLE=on style='position:absolute;overflow-y:scroll;overflow-x:hidden;width:100%;height:20px;border:1px solid gray;'>" +
			"<div UNSELECTABLE=on style=height:100px;></div></div>";
	};

};

//动态带提示的搜索框,或自动完成编辑框,继承自DynaEditor.List
DynaEditor.Search = function(hisfun, runfun)
{
	var self = this;
	var marginRight = 16;
	var img = "<img UNSELECTABLE=on src=../com/pic/search.png style=margin-left:-" + marginRight + "px>";
	DynaEditor.List.call(this);
	this.create = function ()
	{
		self.oEdit = document.createElement("SPAN");
		self.oEdit.style.position = "absolute";
		self.oEdit.style.border = "1px solid #9BC9EB";
		self.oEdit.style.overflow = "hidden";
		self.oEdit.innerHTML = "<input type=text style='width:100%;border:none;height:100%;margin:-1px " + 
			(marginRight + 2) + " 0 1px;'>" + img;
		self.oEdit.firstChild.onkeydown = self.keydown;
		self.oEdit.firstChild.onpropertychange = valuechange;
		if ((typeof runfun == "function") && (img != ""))
			self.oEdit.lastChild.onclick = run;
		else
		{
			if (img != "")
				self.oEdit.lastChild.style.display = "none";
			self.oEdit.firstChild.style.marginRight = "0px";
		}
		document.body.insertAdjacentElement("beforeEnd", self.oEdit);
		self.oEdit.firstChild.onchange = self.onChange;
		self.oEdit.firstChild.onblur = self.hide;
		self.bAutoPop = false;
	};
	
	function valuechange()
	{
		if (self.oEdit.firstChild.value == self.value)
			return;
		if (document.selection.createRange().parentElement() != self.oEdit.firstChild)
			return;
		self.value = self.oEdit.firstChild.value;
		if (typeof hisfun != "function")
			return;
		var data = hisfun(self.value);
		if ((typeof data == "string") && (data != ""))
		{
			self.setData(data);
			self.popDown();
		}
		else
			self.hidePop();
	}

	function run()
	{
		if (typeof runfun == "function")
			runfun(self.oEdit.firstChild.value);
	}

	this.confirm = function(value)
	{
		self.setValue(value);
		self.hide();
		run();
	};
	
	this.setImg = function (pic, width)
	{
		if ((typeof pic != "string") || (pic == ""))
		{
			img = "";
			marginRight = 0;
			return;
		}
		if (typeof width != "undefined")
			marginRight = width;

		if (pic.substr(0, 1) == "<")
			img = pic
		else
			img = "<img UNSELECTABLE=on src=" + pic + " style=margin-left:-" + marginRight + "px>";
	}
};

//动态字体颜色选择对话框
DynaEditor.FontSel = function()
{
	var self = this;
	DynaEditor.Base.call(this);

};

//动态文件上传框
DynaEditor.FileUpload = function(saveurl)
{
	var self = this;
	DynaEditor.Input.call(this, data);

};

function FileUpload()
{
var self = this;
var ocx;
var root = GetRootPath();
var url = root + "/com/upfile.jsp";
var taskcnt = 0;
	function Init()
	{
		if (typeof ocx == "object")
			return true;
		if (document.getElementById("htexOCX") != "object")
			document.body.insertAdjacentHTML("beforeEnd", "<object classid=clsid:805E221F-1C22-424B-BDCD-9CE834919407 codebase=" +
				root + "/htex.ocx" + " id=htexOCX width=1 height=1></object>");
		ocx = document.getElementById("htexOCX");
		ocx.onerror = function ()
		{
			ocx.onerror = null;
			ocx.removeNode(true);
			ocx = undefined;
			if (confirm("重要提示：未能加载安装文件上传控件。\n" +
				"您必须将本站点" + location.hostname + "加入到可信站点，并在安全设置中启用：\n" +
				"下载未签名的ActiveX控件、未标记为可安全执行脚本的ActiveX控件初始化并执行脚本，并允许本页面出现的ActiveX控件的安装选项。才可使用文件上传控件。\n是否要重新安装?"))
				Init();
			return false;
		}
//		ocx.attachEvent("htexEvent", htexEvent);
		ocx.attachEvent("PostFileEvent", PostFileEvent);
	}

	function PostFileEvent(id, param1, param2)
	{
		var evtName, info;
		switch (id)
		{
		case 1:
			evtName = "SendFileBegin";
			info = ocx.HTTPPostGetValue(param1, 1);
			break;
		case 2:
			evtName = "SendFileProgress";
			info = ocx.HTTPPostGetValue(param1, 2);
			break;
		case 3:
			evtName = "SendFileOK";
			info = ocx.HTTPPostGetValue(param1, 4);
			taskcnt --;
			break;
		case 4:
			evtName = "SendFileFail";
			info = ocx.HTTPPostGetValue(param1, 5);
			taskcnt --;
			break;
		default:
			alert("ERROR" + id);
			return;
		}
		self.progress(evtName, param1, info);
	}

	function htexEvent(evtName, param1, param2)
	{
		switch (evtName)
		{
		case "SendFileBegin":
		case "SendFileProgress":
			break;
		case "SendFileOK":
		case "SendFileFail":
			taskcnt --;
			break;
		}
		self.progress(evtName, param1, param2);
	}
	
	this.upload = function(filename, folder, id)
	{
		if (typeof this.getocx() != "object")
			return -1;
		var posturl = url + "?saveto=" + folder;
		if (typeof id != "undefined")
			posturl += "&affixid=" + id;
		var id = ocx.HTTPPostFile(filename, posturl, document.cookie, 1);
		if (id >= 0)
			taskcnt ++;
		return id;
	};

	this.stop = function(id)
	{
		ocx.HTTPPostStop(id);
		if (taskcnt > 0)
			taskcnt --;
	};
	
	this.getocx = function()
	{
		if (typeof ocx != "object")
		{
			Init();
			return;
		}
		return ocx;
	};

	this.gettask = function()
	{
		return taskcnt;
	};
	
	this.openfile = function(fun)
	{
		var o = document.createElement("<input type=file>");
		document.body.insertAdjacentElement("beforeEnd", o);
		o.style.display = "none";
		o.onchange = function ()
		{
			if (o.value != "")
			{
				if (typeof fun == "function")
					fun(o.value);
				else
					this.upload(o.value, "临时共享文件夹");
			}
			o.onchange = null;
			o.removeNode(true);
		}
		o.click();
	};
	
	this.progress = function (evt, param1, param2) {};
	Init();
}

function DragDrop()
{
var self = this;
var srcObj, bDragChanged;
var targets = new Array();
	function DragStart(obj)
	{
		if (event.button == 2)
			return;
	
//		obj.click();
		var oDiv = document.createElement("div");
		oDiv.innerHTML = obj.outerHTML;
		oDiv.style.display = "block";
		oDiv.style.position = "absolute";
		oDiv.style.filter = "alpha(opacity=70)";
		document.body.appendChild(oDiv);
		oDiv.style.top = GetObjPos(obj).top;
		oDiv.style.left = GetObjPos(obj).left;
		BeginDragObj(oDiv);
		document.onmousemove = Draging;
		document.onmouseup = EndDrag;
		bDragChanged = 0;
		srcObj = obj;
	}

	function Draging()
	{
	var x, pos, tx, ty;
		DragingObj();
		tx = event.clientX;
		ty = event.clientY;
		for (x = 0; x < targets.length; x++)
		{
			if (targets[x] != srcObj)
			{
				pos = GetObjPos(targets[x]);
				if(tx >= pos.left && tx <= pos.right && ty >= pos.top && ty <= pos.bottom)
				{
					if (self.dragtest(targets[x]))
					{
						targets[x].insertAdjacentElement("afterEnd", srcObj);
						bDragChanged = 1;
					}
				}
			}
		}
	}

	function EndDrag()
	{
		ResetObjPos(dragObj, 15);
		EndDragObj();
	}

	function ResetObjPos(obj, delta)
	{
		var pos = GetObjPos(dragObj);
		var tx = obj.style.pixelLeft;
		var ty = obj.style.pixelTop;
		var dx = (tx - pos.left) / delta;
		var dy = (ty - pos.top) / delta;
		var oInterval = window.setInterval(function()
		{
			if (delta > 1)
			{
				delta --;
				tx -= dx;
				ty -= dy;
				if (tx < 0)
					tx = 0;
				if (ty < 0)
					ty < 0;
				obj.style.left = tx + "px";
				obj.style.top = ty + "px";
			}
			else
			{
				clearInterval(oInterval);
				obj.removeNode(true);
//				if (bDragChanged == 1)
//					UserDragFun(2, SeekDragSrcObj, oldParent);
				return;
			}
		}, 20);
	}

	this.attachSrc = function(hitobj, dragobj)
	{
		if (typeof dragobj == "undefined")
			dragobj = hitobj;
		hitobj.onmousedown = function () 
		{
			DragStart(dragobj);
		};
	};
	
	this.detachSrc = function(hitobj)
	{
		hitobj.onmousedown = null;
	};
	
	this.attachTarget = function (obj)
	{
		targets[targets.length] = obj;
	};
	
	this.detachTarget = function (obj)
	{
		
	};
	
	this.ondrag = function()
	{
	};
	
	this.ondraging = function ()
	{
	};
	
	this.ondragend = function ()
	{
	};
	
	this.dragtest = function(obj)
	{
		return true;
	}
}

function WebOffice(ocx, filename, openurl, saveurl)
{
	var self = this;
	var imenu;

	function Init()
	{
		ocx.attachEvent("OnDocumentOpened", onDocumentOpened);
		switch (filename) 
		{
		case ".xls":
			ocx.CreateNew("Excel.Sheet");
			break;
		case ".ppt":
			ocx.CreateNew("PowerPoint.Show");
			break;
		case ".doc":
			ocx.CreateNew("Word.Document");
			break;
		default:
			if (filename != "")
				ocx.Open(openurl + filename, false);
			break;
		}
	}
	
	
	function onDocumentOpened(file, doc)
	{
		addmenu();
	}
	
	function addmenu()
	{
		var pos = GetObjPos(ocx);
		imenu = document.createElement("iframe");
		imenu.frameBorder = "no";
		document.body.insertAdjacentElement("beforeEnd", imenu);
		imenu.style.position = "absolute";
		imenu.style.width = pos.right - pos.left - 530;
		imenu.style.height = "20px";
		imenu.style.top = pos.top + 3;
		imenu.style.left = pos.left + 520;
		imenu.scrolling = "no";
		imenu.contentWindow.document.write("<html><style type=text/css>" +
			"span{font-size:9pt;padding:2px 5px 0px 5px;}</style>" +
			"<body bgcolor=threedface scroll=no style=margin:3px><div id=webofficemenu style=cursor:hand>" +
			"<span>保存</span>" +
			"</div></body></html>");
		imenu.contentWindow.document.close();
//			"<span>痕迹</span><span>取消痕迹</span>"<span>接受修改</span><span>禁止修订</span><span>禁止</span>" +
		imenu.contentWindow.document.all.webofficemenu.onclick = SaveDoc;

	}
	
	function SaveDoc()
	{
		alert("save");
		ocx.HttpAddPostString("rename", this.rename); 
		ocx.HttpAddPostString("loadtype", "doc,xls,ppt"); 
		ocx.HttpAddPostString("filepath", this.serverPath); 
		ocx.HttpAddPostCurrFile("file1", this.docName);
		var rtn = ocx.HttpPost(saveurl);
	}
	Init();
}

function OfficeInput(domobj)
{
	var hidobj = domobj.previousSibling;
	var conobj = domobj.parentNode;
	var readonly = parseInt(hidobj.bReadonly);
	var rows = hidobj.rows;
	var username = hidobj.user;
	var editmode = hidobj.editmode;
	var App, oUpload;	
	var doclist = [];
	var watch;
	var root = GetRootPath();

	function InitDoc()
	{
		var ss = hidobj.value.split(",");
		for (var x = 0; x < ss.length; x++)
		{
			doclist[x] = {};
			if (ss[x] == "")
				var sss = ["0", ""];
			else
				var sss = ss[x].split(":");
			
			doclist[x].id= parseInt(sss[0]);
			if (sss.length > 1)
				doclist[x].name = sss[1];
			else
				doclist[x].name = "";
			if (x == 0)
				InitDocbar(domobj, x);
			else
				InitDocbar(0, x);
		}
	}

	function OfficeUploadEvent(evt, param1, param2)
	{
		switch (evt)
		{
		case "SendFileBegin":
			break;
		case "SendFileProgress":
			break;
		case "SendFileOK":
			var ss = param2.split(":");
			var uploadid = parseInt(param1);
			if (ss[0] == "OK")
			{
				for (var x = 0; x < doclist.length; x++)
				{
					if (doclist[x].uploadid == uploadid)
					{
						doclist[x].id = parseInt(ss[1]);
						doclist[x].uploadid = -1;
						doclist[x].fullname = undefined;
						UploadOKEvent();
						break;
					}
				}
			}
			else
				alert(param2);
			break;
		case "SendFileFail":
			oUpload.stop(param1);
			alert("错误", "上传OFFICE文件失败：" + param2);
			break;
		}
	}
	
	function UploadOKEvent() {}
	
	function InitDocbar(obj, index)
	{
		var result = "";
		if (typeof obj != "object")
		{
			obj = document.createElement("SPAN");
			obj.className = "OfficeInput";
			conobj.insertAdjacentHTML("beforeEnd", "<br>");
			conobj.insertAdjacentElement("beforeEnd", obj);
		}
		if (readonly == 0)
		{
			var o = CreateDocButton(obj, "新建", NewDoc);
			o = CreateDocButton(o, "上传", UploadDoc);
			o = CreateDocButton(o, "阅读", ReadDoc);
			o = CreateDocButton(o, "编辑", EditDoc);
			o = CreateDocButton(o, "下载", "", root + "/com/down.jsp?AffixID=" + doclist[index].id);
			o = CreateDocButton(o, "删除", DeleteDoc);
			oUpload = new FileUpload();
			oUpload.progress = OfficeUploadEvent;
		}
		else
		{
			if (doclist[index].id != 0)
			{
				var o = CreateDocButton(obj, "阅读", ReadDoc);
				o = CreateDocButton(o, "下载", "", root + "/com/down.jsp?AffixID=" + doclist[index].id);
			}
		}
		obj.innerText = doclist[index].name;
	}

	function CreateDocButton(obj, name, click, href)
	{
		var o = document.createElement("A");
		o.innerText = name;
		if (click == "")
			o.href = href;
		else
		{
			o.onclick = click;
			o.href = "javascript:void(0)";
		}
		o.style.marginLeft = "5px";
		obj.insertAdjacentElement("afterEnd", o);
		return o;
	}

	function getDocIndex(obj)
	{
		var objs = conobj.getElementsByTagName("A");
		var index = -1;
		for (var x = 0; x < objs.length; x++)
		{
			if (objs[x].innerText == obj.innerText)
				index ++;
			if (objs[x] == obj)
				break;
		}
		return index;
	}
	
	function SetSyn()
	{
		if (typeof watch == "undefined")
			watch = window.setInterval(SyncStatus, 500);
		SyncStatus();
	}
		
	function SyncStatus()
	{
		var objs = conobj.getElementsByTagName("SPAN");
		var cnt = 0;
		for (var x = 0; x < doclist.length; x++)
		{
			if (typeof doclist[x].doc == "object")
			{
				try
				{
					objs[x].innerHTML = doclist[x].doc.name + "<q style=color:gray>(编辑中...)</q>";
					doclist[x].name = doclist[x].doc.name;
					doclist[x].fullname = doclist[x].doc.FullName;
				}
				catch (e)
				{
					if (doclist[x].fullname == doclist[x].name)
						objs[x].innerHTML = doclist[x].name + "<q style=color:gray>(OFFICE错误。" + e.description + ")</q>";
					else
						objs[x].innerHTML = doclist[x].name + "<q style=color:gray>(已保存)</q>";
				}
				cnt ++;
			}
			else
				objs[x].innerHTML = doclist[x].name;
		}
		if (cnt == 0)
		{
			clearInterval(watch);
			watch = undefined;
		}
	}
	
	function CreateApp()
	{
		if (typeof App != "object")
		{
			try
			{
				App = new ActiveXObject("Word.Application");
				App.visible=true;
				App.UserName = username;
			} catch (e)
			{
				alert("未能打开本地的OFFICE程序。");
				return false;
			}
		}
		else
		{
			try
			{
				App.visible = true;
			}
			catch (e)
			{
				App = new ActiveXObject("Word.Application");
				App.visible=true;
				for (var x = 0; x < doclist.length; x++)
					doclist[x].doc = undefined;
			}
		}
	}
	
	function NewDoc()
	{
		if (CreateApp() == false)
			return;
		var doc = App.Documents.Add();
		App.Activate();
		doc.ActiveWindow.Activate();
		var index = doclist.length;
		if (doclist[index - 1].name == "")
		{
			doclist[index - 1].name = doc.FullName;
			doclist[index - 1].doc = doc;
			domobj.innerText = doc.FullName;
		}
		else
		{
			doclist[index] = {};
			doclist[index].id = 0;
			doclist[index].name = doc.FullName;
			doclist[index].status = "";
			doclist[index].doc = doc;
			InitDocbar(0, index);
		}
		SetSyn();
	}
	
	function EditDoc()
	{
		var index = getDocIndex(event.srcElement);
		if (typeof doclist[index].doc == "object")
		{
			CreateApp();
			try
			{
				doclist[index].doc.ActiveWindow.Activate();
				App.Activate();
			}
			catch (e)
			{
				alert("文档已关闭或不可用。");
//				event.srcElement.nextSibling.nextSibling.click();
			}
			return;
		}
		if (doclist[index].id == 0)
			return;

		if (CreateApp() == false)
			return;
		var doc = App.Documents.Open(root + "/com/down.jsp?AffixID=" + doclist[index].id);
		doc.SaveAs(App.Options.DefaultFilePath(0) + "\\" + doclist[index].name);
		doc.TrackRevisions = true;
		doclist[index].doc = doc;
		doclist[index].fullname = doc.FullName;
		App.Activate();
		doc.ActiveWindow.Activate();
		SetSyn();
//		alert(doc.Saved);
	}
	
	function ReadDoc()
	{
		var index = getDocIndex(event.srcElement);
		if (doclist[index].id == 0)
			return;
		if (CreateApp() == false)
			return;
		var href = root + "/com/down.jsp?AffixID=" + doclist[index].id;
		var doc = App.Documents.Open(href);
		doc.ActiveWindow.Caption = doclist[index].name;
		App.Activate();
		doc.ActiveWindow.Activate();
	}
	
	function DownDoc()
	{
		var index = getDocIndex(event.srcElement);
		if (doclist[index].id == 0)
			return alert("未上传。");
		location.href =	root + "/com/down.jsp?AffixID=" + doclist[index].id;
	}
	
	function DeleteDoc()
	{
		var obj = event.srcElement;
		var index = getDocIndex(obj);
		if (doclist[index].id != 0)
		{
			if (window.confirm("是否删除已上传的文件") == false)
				return;
			AjaxRequestPage("../com/upload.jsp?option=DeleteFile&fileName0=" + doclist[index].id, true, "",
				function (data){alert(data);});
		}
		if (index > 0)
		{
			for (var x = 0; x < 7; x++)
				obj.previousSibling.removeNode(true);
			obj.removeNode(true);
			doclist.splice(index, 1);
		}
		else
		{
			doclist[0].id = 0;
			doclist[0].name = "";
			doclist[0].doc = undefined;
			domobj.innerText = "";
		}
	}
	
	this.SaveDoc = function (funok)
	{
		if (typeof funok == "function")
			UploadOKEvent = funok;
		for (var x = 0; x < doclist.length; x++)
		{
			if (typeof doclist[x].fullname == "string")
			{
				if (typeof doclist[x].doc == "object")
				{
					try
					{
						doclist[x].doc.Save();
						SyncStatus();
						doclist[x].doc.Close();
					}
					catch (e)
					{
					}
					doclist[x].doc = undefined;
				}
				if (doclist[x].fullname == doclist[x].name)
					alert("不能上传文件，[" + doclist[x].name + "]文件已丢失。");
				else
				{
					if ((typeof doclist[x].uploadid == "undefined") || (doclist[x].uploadid < 0))
					{
						doclist[x].uploadid = oUpload.upload(doclist[x].fullname, "临时共享文件夹", doclist[x].id);
						if (doclist[x].uploadid < 0)
							alert("上传OFFICE文件失败:" + doclist[x].uploadid);
					}
				}
//				if (savefile(x) != "OK")
					return false;
				SyncStatus();
			} 
		}
		var value = "";
		for (var x = 0; x < doclist.length; x++)
		{
			if (doclist[x].id != 0)
			{
				if (value != "")
					value += ",";
				value += doclist[x].id + ":" + doclist[x].name;
			}
		}
		hidobj.value = value;
		return true;	
	}
	
	function UploadDoc()
	{
		UploadDoc.SubmitLocalFileOK = SubmitLocalFileOK;
		SubmitLocalFileOK = UploadOK;
		StartSubmitLocalFile("临时共享文件夹");
	}
	
	function UploadOK(FileType, AffixID, FileCName)
	{
		UploadOK.obj = undefined;

		var index = doclist.length;
		if (doclist[index - 1].name == "")
		{
			doclist[index - 1].name = FileCName;
			doclist[index - 1].id = AffixID;
			domobj.innerText = FileCName;
		}
		else
		{
			doclist[index] = {};
			doclist[index].id = AffixID;
			doclist[index].name = FileCName;
			InitDocbar(0, index);
		}
		SubmitLocalFileOK = UploadDoc.SubmitLocalFileOK;
	}
	InitDoc();
}

function ConSignEditor(domobj)
{
	var hidobj = domobj.previousSibling;
	var username = hidobj.UserName;
	var readonly = parseInt(hidobj.bReadonly);
	var bRequired = parseInt(hidobj.bRequired);
	var oldvalue = hidobj.value;
	var editobj;
	function onchange()
	{
		if (readonly == 2)
			hidobj.value = username + ":" + editobj.value.replace(/:/g, "：").replace(/;/g, "；") + ";";
		else
			hidobj.value = oldvalue + username + ":" + editobj.value.replace(/:/g, "：").replace(/;/g, "；") + ";";
	}

	function Init()
	{
		var EName = hidobj.name;
		var CName = hidobj.CName.split(",");
		var rows = parseInt(hidobj.rows);
		var lineheight = parseInt(hidobj.lineHeight);
		if ((readonly == 1) && (hidobj.value == ""))
			return "";
		var tag = "<input type=hidden name=" + EName + "_Pattern value='" + username + ":.*;'><div";
		var ss = hidobj.value.split(";");
		if ((rows > 1) && (ss.length > rows))
			tag += " style=width:100%;height:" + (rows * 24) + "px;overflow-y:auto";
		tag += "><table style=width:100%;>";
		var value = oldvalue;
		if ((value.indexOf(username + ":") < 0) && (readonly != 1))
		{
			if (value != "")
				value += ";";
			value += username + ":;";
		}
		var ss = value.split(";");
		for (var x = 0; x < ss.length; x++)
		{
			var sss = ss[x].split(":");
			if (sss.length < 2)
				continue;
			if ((Trim(sss[1]) == "") && ((readonly == 1) || (sss[0] != username)))
				continue;
			tag += "<tr><td width=5% nowrap class=jformconreadonly1>" + CName[0] + "</td><td width=20%><input name=" +
				EName + "_F1 readonly class=textreadonly value='" + sss[0] + "' style=width:100%;></td>";
			if ((sss[0] == username) && (readonly != 1))
			{
				tag += "<td width=5% nowrap class=jformcon1>" + CName[1] + "</td><td width=70%>";
				var sreq = "";
				if (bRequired == 1)
					sreq = " bRequired=1";
				if (lineheight == 1)
					tag += "<input id=ConsignInput name=" + EName + "_F2" + sreq + " class=text style=width:100%; value='" + sss[1] + "'>";
				else
					tag += "<textarea id=ConsignInput name=" + EName + "_F2" + sreq + " class=text rows=" + lineheight + " style=width:100%;>" + sss[1] + "</textarea>";				
			}
			else
			{
				tag += "<td width=5% nowrap class=jformconreadonly1>" + CName[1] + "</td><td width=70%>";
				if (lineheight == 1)
					tag += "<input readonly name=" + EName + "_F2 class=textreadonly style=width:100%; value=" + sss[1] + ">";
				else
					tag += "<div id=TextReadOnlyViewDiv rows=" + lineheight + " style=width:100%;height:" + rows * 20 + "px;>" + sss[1].replace(/\n/g, "<br>") + "</div>";
			}
			tag += "</td></tr>";
		}
		domobj.insertAdjacentHTML("beforeEnd", tag + "</table></div>");
		editobj = domobj.all.ConsignInput;
		switch (readonly)
		{
		case 0:			//edit
			hidobj.value = value;
		case 1:			//readonly
			break;
		case 2:			//append
			hidobj.value = username + ":;";
			break;
		}
			
		if (typeof editobj == "object")
		{
			editobj.onchange = onchange;
			editobj.scrollIntoView();
		}
	}
	Init();
}

function SizeBox(mode, bgcolor, maskcolor, opacity)
{
	var self = this;
	var domobj, mask, nAction, px, py;
	var eleft = -2048, etop = -2048, eright = 2048, ebottom = 2048;
	var minwidth = 8, minheight = 8; maxwidth = 4096, maxheight = 4096;
	var old = {left:0, top:0, width:100, height:100, status:0};
	function init()
	{
		if (typeof bgcolor == "undefined")
			bgcolor = "blue"; 
		mask = document.createElement("<DIV style='position:absolute;overflow:hidden;padding:4px;display:none;'></DIV>");
		document.body.insertBefore(mask);
		mask.onmousedown = MouseBegin;
		mask.onmousemove = MouseEdge;
		mask.ondblclick = self.dblclick;
		if (mode == 0)		//没有缩放的指示框
			return;
		var tag = "<div style=position:absolute;overflow:hidden;width:4px;height:5px;background-color:" + bgcolor + "></div>";
		mask.innerHTML = "<div style='width:100%;height:100%;overflow:hidden;'></div>" +
			tag + tag + tag + tag + tag + tag + tag + tag;
		if (typeof maskcolor == "string")		//用透明属性盖住对象，以获得事件
		{
			mask.firstChild.style.backgroundColor = maskcolor;
			mask.firstChild.style.filter = "alpha(opacity=" + opacity + ")";
		}	
		mask.children[1].style.cursor = "NW-resize";
		mask.children[2].style.cursor = "N-resize";
		mask.children[3].style.cursor = "NE-resize";
		mask.children[4].style.cursor = "W-resize";
		mask.children[5].style.cursor = "E-resize";
		mask.children[6].style.cursor = "SW-resize";
		mask.children[7].style.cursor = "S-resize";
		mask.children[8].style.cursor = "SE-resize";
	}
	
	function MouseBegin()
	{
		for (var x = 0; x < mask.children.length; x++)
		{
			if (event.srcElement == mask.children[x])
				break;
		}
		if (x < mask.children.length)
			nAction = x;
		self.start(nAction);
	}


	function MouseEdge()
	{
		if (mode == 0)
			return;
		var pos = GetObjPos(mask);
		if (event.x < pos.left + 4)
		{
			mask.style.cursor = "W-resize";
			nAction = 4;
			return;
		}
		if (event.x > pos.right - 4)
		{
			mask.style.cursor = "E-resize";
			nAction = 5;
			return;
		}
		if (event.y < pos.top + 4)
		{
			mask.style.cursor = "N-resize";
			nAction = 2;
			return;
		}
		if (event.y > pos.bottom - 4)
		{
			mask.style.cursor = "S-resize";
			nAction = 7;
			return;
		}
		mask.style.cursor = "default";
		nAction = 0;
	}

	function MouseAction()
	{
		Action(nAction);
		Apply();
	}

	function Apply()
	{
		domobj.style.left = mask.style.pixelLeft + 2;
		domobj.style.top = mask.style.pixelTop + 2;
		domobj.style.width = mask.style.pixelWidth - 4;
		domobj.style.pixelHeight = mask.style.pixelHeight - 4;
		domobj.style.height = mask.style.pixelHeight - 4;
		SetBox();
		self.ActionEvent(2, nAction);
	}
	
	function Action(action)
	{
		switch (action)
		{
		case 0:		//MOVE
			if (event.x + px < eleft)
				mask.style.pixelLeft = eleft;
			else if (event.x + px + mask.style.pixelWidth > eright)
				mask.style.pixelLeft = eright - mask.style.pixelWidth;
			else
				mask.style.pixelLeft = event.x + px;
			
			if (event.y + py < etop)
				mask.style.pixelTop = etop;
			else if (event.y + py + mask.style.pixelHeight > ebottom)
				mask.style.pixelTop = ebottom - mask.style.pixelHeight;
			else
				mask.style.pixelTop = event.y + py;
			break;
		case 1:		//SIZE:left top
			Action(2);
			Action(4);
			break;
		case 2:		//SIZE:top
			var b = mask.style.pixelTop + mask.style.pixelHeight;
			if (b - event.y < minheight)
			{
				mask.style.pixelHeight = minheight;
				mask.style.pixelTop = b - minheight;
			}
			else if (b - event.y > maxheight)
			{
				mask.style.pixelHeight = maxheight;
				mask.style.pixelTop = b - maxheight;
			}
			else
			{
				mask.style.pixelTop = event.y;
				mask.style.pixelHeight = b - mask.style.pixelTop;
			}
			break;
		case 3:		//SIZE: right top
			Action(2);
			Action(5);
			break;
		case 4:		//SIZE: left
			var r = mask.style.pixelLeft + mask.style.pixelWidth;
			if (r - event.x < minwidth)
			{
				mask.style.pixelWidth = minwidth;
				mask.style.pixelLeft = r - minwidth;
			}
			else if (r - event.x > maxwidth)
			{
				mask.style.pixelWidth = maxwidth;
				mask.style.pixelLeft = r - maxwidth;
				
			}
			else
			{
				mask.style.pixelLeft = event.x;
				mask.style.pixelWidth = r - mask.style.pixelLeft;
			}
			break;
		case 5:		//SIZE:	right
			if (event.x - mask.style.pixelLeft < minwidth)
				mask.style.pixelWidth = minwidth;
			else if (event.x - mask.style.pixelLeft > maxwidth)
				mask.style.pixelWidth = maxwidth;
			else
				mask.style.pixelWidth = event.x - mask.style.pixelLeft;
			break;
		case 6:		//SIZE:	left bottom
			Action(4);
			Action(7);
			break;
		case 7:		//SIZE:	bottom
			if (event.y - mask.style.pixelTop < minheight)
				mask.style.pixelHeight = minheight;
			else if (event.y - mask.style.pixelTop > maxheight)
				mask.style.pixelHeight = maxheight;
			else
				mask.style.pixelHeight = event.y - mask.style.pixelTop;
			break;
		case 8:		//SIZE: right bottom
			Action(5);
			Action(7);
			break;
		case 9:
			break;
		}
	}
	
	function MouseEnd()
	{
		document.detachEvent("onmousemove", MouseAction);
		document.detachEvent("onmouseup", MouseEnd);
		mask.onmousemove = MouseEdge;
		self.ActionEvent(3, nAction);
	}

	function SetBox()
	{
		if (mode == 0)
			return;
		var pos = GetObjPos(domobj);
		mask.children[1].style.pixelTop = 0;		//left top
		mask.children[1].style.pixelLeft = 0;
		mask.children[2].style.pixelTop = 0;		//top
		mask.children[2].style.pixelLeft = parseInt((pos.right - pos.left) / 2);
		mask.children[3].style.pixelTop = 0;		//right top
		mask.children[3].style.pixelLeft = pos.right - pos.left - 1;

		mask.children[4].style.pixelTop = parseInt((pos.bottom - pos.top) / 2);
		mask.children[4].style.pixelLeft = 0;		//left
		mask.children[5].style.pixelTop = parseInt((pos.bottom - pos.top) / 2);
		mask.children[5].style.pixelLeft = pos.right - pos.left - 1;	//right

		mask.children[6].style.pixelTop = pos.bottom - pos.top - 1;
		mask.children[6].style.pixelLeft = 0;		//left bottom
		mask.children[7].style.pixelTop = pos.bottom - pos.top - 1;		//bottom
		mask.children[7].style.pixelLeft = parseInt((pos.right - pos.left) / 2);
		mask.children[8].style.pixelTop = pos.bottom - pos.top - 1;		//right bottom
		mask.children[8].style.pixelLeft = pos.right - pos.left - 1;	
	};

	this.start = function (act)
	{
		if (typeof act != "number")
			act = 0;
		if (old.status == 1)
			return;
		nAction = act;
		var pos = GetObjPos(mask);
		px = pos.left - event.x;
		py = pos.top - event.y;
		mask.onmousemove = null;
		document.attachEvent("onmousemove", MouseAction);
		document.attachEvent("onmouseup", MouseEnd);
		self.ActionEvent(1, nAction);
	};

	this.runMax = function()
	{
		if (old.status == 0)
		{
			old.status = 1;
			old.left = mask.style.left;
			old.top = mask.style.top;
			old.width = mask.style.width;
			old.height = mask.style.height;

			mask.style.left = 0;
			mask.style.top = 0;
			mask.style.width = "100%";
			mask.style.height = "100%";
			mask.style.display = "none";

		}
		else
		{
			old.status = 0;
			mask.style.left = old.left;
			mask.style.top = old.top;
			mask.style.width = old.width;
			mask.style.height = old.height;
			mask.style.display = "block";
		}
		Apply();
	}
	this.dblclick = function (){};

	this.attach = function (obj)
	{
		domobj = obj;
		var pos = GetObjPos(obj);
		mask.style.pixelTop = pos.top - 2;
		mask.style.pixelLeft = pos.left - 2;
		mask.style.pixelWidth = pos.right - pos.left + 4;
		mask.style.pixelHeight = pos.bottom - pos.top + 4;
		mask.style.display = "block";
		SetBox();
	}

	this.detach = function ()
	{
		mask.style.display = "none";
	};

	this.SetMaxRange = function (l, t, r, b)
	{
		eleft = l - 2;
		etop = t - 2;
		eright = r + 2;
		ebottom = b + 2;
	
	}
	
	this.SetLimitBox = function (type, w, h)
	{
		switch (type)
		{
		case 0:
			minwidth = w + 4;
			minheight = h + 4;
			break;
		case 1:
			maxwidth = w;
			maxheight = h;
			break;
		}
	};

	this.remove = function ()
	{
		mask.removeNode(true);
	};

	this.ActionEvent = function(status, action)	{};
	init();
}