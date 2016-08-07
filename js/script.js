(function() {
    'use strict';

    /*
     * Global Variables
     */

    var i;
    var length;
    var g = {
        mouse: {
            x: 0,
            y: 0,
            startX: 0,
            startY: 0,
            xDiff: function() {
                return g.mouse.x - g.mouse.startX;
            },
            yDiff: function() {
                return g.mouse.y - g.mouse.startY;
            }
        },
        divBox: null,
        numImg: 24,
        imgVal: '',
        boolean: true
    };
    var wsurl="wss://127.0.0.1:8443/websocket_server/mark";

    //Check Browser Compatibility
    //Codes are from html5test.com
    function chkCompatibility(){
      //Check Color Input Types
      var createInput = function (type) {
        var field = document.createElement('input');
        try {
            field.setAttribute('type', type);
        } catch (e) {
        }
        return field;
      };
      var element = createInput('color');
      element.value = "foobar";
      var sanitization = element.value != 'foobar';
      if(!((element.type=='color')&&(element.value!='foobar'))){
        alert("Your browser does not support color input types!");
        return false;
      }

      //Check WebSocket
      if(!('WebSocket' in window)){
        alert("Your browser does not support websocket!");
        return false;
      }

      //Check JSON support
      if(!('JSON' in window && 'parse' in JSON)){
        alert("Your browser does not support JSON Encoding!");
        return false;
      }

      return true;
    }
    if(chkCompatibility()){
      //alert("Compatibility check passed!");
    }else{
      alert("Compatibility check failed!");
    }

    // Get URL parameters
  	// http://www.cnblogs.com/shengxiang/archive/2011/09/19/2181629.html
  	function GetURLParam(name)
  	{
  		var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
  		var r = window.location.search.substr(1).match(reg);
  		if (r!=null) return unescape(r[2]);
  		return null;
  	}

    //Check assignmentId
    if(GetURLParam("assignmentId")=="ASSIGNMENT_ID_NOT_AVAILABLE"){
      document.getElementById("submit").style.display="none";
    }

    /*
     * Global, short, usable functions
     */
    function checkCSS(elem, prop, val) {
        /*
         * elem: The DOM element to check CSS
         * prop: The property of the DOM element
         * val: The possible value of the property of the DOM element
         */
        prop = prop ? prop : 'color';
        val = val ? val : 'rgb(255, 255, 255)';
        return $(elem).css(prop) === val;
    }

    function changeCountBoxes(num) {
        /*
         * num: A number that is added to countBoxes.innerHTML
         */
        countBoxes.innerHTML = +countBoxes.innerHTML + num;
        if (+countBoxes.innerHTML < 0) {
            countBoxes.innerHTML = 0;
        }
    }

    function destroy() {
        $(magnifyIcon).removeClass('magnifyIcon');
        $('.magnify').remove();
        $(image).prepend('<img class="zoom" src="' + g.imgVal + '" data-magnify-src="' + g.imgVal + '">');
    }

    function changeSource() {
      var websocket=new WebSocket(wsurl);
      var imgFile="";
      var foundimage=true;

      //Called on error
      websocket.onerror=function(){
        alert("Something went wrong...");
      }

      //Called on message
      websocket.onmessage=function(event){
        imgFile=event.data;
        if(imgFile=="notfound"){
          alert("HIT does not exist!");
          foundimage=false;
        }else{
          g.imgVal = './pictures/'+imgFile;
          //alert('pictures/'+imgFile);
          $('.zoom')[0].src = g.imgVal;
          $('.zoom').attr('data-magnify-src', g.imgVal);
        }
        websocket.close();
      }

      //Called on close
      websocket.onclose=function(){
      }

      //Auto close connection on exit
      window.onbeforeunload=function(){
        websocket.close();
      }

      //Called on connection established
      websocket.onopen=function(){
        var jsonObj={
          msgtype:"getimage",
          hitId:GetURLParam("hitId")
        };
        websocket.send(JSON.stringify(jsonObj));
      }
    }
    changeSource();

    function checkBoxes() {
        if (image.children.length > 1) {
            return true;
        } else {
            return false;
        }
    }

    function removeBoxes() {
        if (checkBoxes()) {
            $('.box').remove();
        }
        changeCountBoxes(-countBoxes.innerHTML);
    }

    function addPX() {
        if ($('.box').css('border-width') === '2px') {
            $('.box').css('border-width', '2.25px');
        }
    }

    /*
     * Change the background-color and color of toggles
     * #black and #white affect the color of the drawed boxes
     * #drag and #clickAndDrag affect how boxes are drawed
     */

    function setToggle() {
        function select(elem) {
            /*
             * elem: A DOM element that is animated with a green background and white text
             */
            $(elem).animate({
                backgroundColor: '#16a085',
                color: 'white'
            }, 150, 'easeOutQuad');
        }

        function toggleColors(elem) {
            /*
             * elem: A DOM element that turns back to a grey background and black text, along with its siblings
             */
            var childrenElem = elem.parentElement.children;
            for (i = 0, length = childrenElem.length; i < length; i++) {
                $(childrenElem[i]).css('background-color', '#e8e8e8');
                $(childrenElem[i]).css('color', 'black');
            }
            select(elem);
        }

        function setProp(prop, val, text) {
            /*
             * prop: CSS property to change for .box elements
             * val: CSS value to use
             */
            var boxes = document.getElementsByClassName('box');
            for (i = 0; i < boxes.length; i++) {
                if (!text || boxes[i].innerHTML === '<p>' + text + '</p>') {
                    $(boxes[i]).css(prop, val);
                }
            }
        }

        function colors() {
            setProp('color', this.value, this.previousSibling.innerHTML);
            setProp('border-color', this.value, this.previousSibling.innerHTML);
        }

        person.onclick = function() {
            toggleColors(this);
        };
        automobile.onclick = function() {
            toggleColors(this);
        };
        color1.oninput = colors;
        color2.oninput = colors;
        onePX.onclick = function() {
            toggleColors(this);
            setProp('border-width', this.innerHTML);
        };
        twoPX.onclick = function() {
            toggleColors(this);
            setProp('border-width', this.innerHTML);
            addPX();
        };
        drag.onclick = function() {
            toggleColors(this);
            image.removeEventListener('click', startMouse);
            image.addEventListener('mousedown', startMouse);
            image.addEventListener('mouseup', startMouse);
        };
        clickAndDrag.onclick = function() {
            toggleColors(this);
            image.removeEventListener('mousedown', startMouse);
            image.removeEventListener('mouseup', startMouse);
            image.addEventListener('click', startMouse);
        };
        magnifyIcon.onclick = function() {
            if ($(magnifyIcon).hasClass('magnifyIcon') === true) {
                destroy();
            } else {
                $(magnifyIcon).addClass('magnifyIcon');
                $('.zoom').attr('height', $('.zoom').height() + 'px');
                $('.zoom').magnify();
            }
        };
    }
    setToggle();

    /*
     * Start/End the drawing box process
     */

    function startMouse(event) {
        function checkAndChange(elem, prop, bool) {
            /*
             * elem: parent element containing the children elements to check and set CSS value
             * prop: CSS property to set the boxes (DOM style)
             * bool: If it's true, the CSS value comes from elem.children[i]. If it's false, the CSS value comes from its next sibling.
             */
            for (i = 0, length = elem.children.length; i < length; i++) {
                if (checkCSS(elem.children[i])) {
                    if (bool) {
                        g.divBox.style[prop] = elem.children[i].innerHTML;
                        addPX();
                    } else if (i !== length - 1) {
                        g.divBox.style[prop] = elem.children[i].nextSibling.value;
                    }
                }
            }
        }
        if (g.divBox === null) {
            if (event.target.tagName !== 'P' && event.target.tagName !== 'DIV') {
                g.mouse.startX = g.mouse.x;
                g.mouse.startY = g.mouse.y;
                g.divBox = document.createElement('div');
                g.divBox.className = 'box';
                checkAndChange(color, 'color', false);
                checkAndChange(color, 'borderColor', false);
                checkAndChange(borderWidth, 'borderWidth', true);
                g.divBox.style.left = g.mouse.x + 'px';
                g.divBox.style.top = g.mouse.y + 'px';
                image.appendChild(g.divBox);
                image.style.cursor = 'crosshair';
                if (checkCSS(drag)) {
                    image.addEventListener('mouseup', startMouse);
                } else {
                    image.removeEventListener('mouseup', startMouse);
                }
            } else {
                image.removeEventListener('mouseup', startMouse);
            }
        } else {
            if (Math.abs(g.mouse.xDiff()) < 10 || Math.abs(g.mouse.yDiff()) < 10) {
                $(g.divBox).remove();
            } else {
                $('.box').draggable({
                    containment: 'parent'
                });
                $('.box').resizable({
                    containment: 'parent'
                });
                var annotation;
                if (checkCSS(person)) {
                    annotation = 'Person';
                } else {
                    annotation = 'Automobile';
                }
                $(g.divBox).prepend('<p>' + annotation + '</p>');
                changeCountBoxes(1);
            }
            g.divBox = null;
            image.style.cursor = '';
        }
    }

    /*
     * Drawing boxes
     * http://stackoverflow.com/questions/17408010/drawing-a-rectangle-using-click-mouse-move-and-click
     */

    function initDraw() {
        image.ondragstart = function(event) {
            var $box = $('.box');
            for (i = 0; i < $box.length; i++) {
                if ($box[i] === event.target) {
                    return true;
                }
            }
            return false;
        };

        function setMousePos(e) {
            var imgLeft = image.getBoundingClientRect().left;
            var imgTop = image.getBoundingClientRect().top;
            g.mouse.x = e.pageX + window.pageXOffset - imgLeft - $(window).scrollLeft() * 2;
            g.mouse.y = e.pageY + window.pageYOffset - imgTop - $(window).scrollTop() * 2;
        }
        // $(window).scrollLeft()
        image.onmousemove = function(event) {
            setMousePos(event);
            function toPercent(val) {
                return val * 100 + '%';
            }
            if (g.divBox !== null) {
                var left, top;
                g.divBox.style.width = Math.abs(g.mouse.xDiff()) / image.offsetWidth * 100 + '%';
                g.divBox.style.height = Math.abs(g.mouse.yDiff()) / image.offsetHeight * 100 + '%';
                left = g.mouse.xDiff() > 0 ? g.mouse.startX : g.mouse.x;
                g.divBox.style.left = toPercent(left / image.offsetWidth);
                top = g.mouse.yDiff() > 0 ? g.mouse.startY : g.mouse.y;
                g.divBox.style.top = toPercent(top / image.offsetHeight);
            }
        };
        image.addEventListener('mousedown', startMouse);
        image.addEventListener('mouseup', startMouse);
        image.addEventListener('mouseleave', function() {
            image.removeEventListener('mouseup', startMouse);
            if (!g.divBox) {
                g.divBox = null;
                image.style.cursor = '';
            }
        });
    }
    initDraw();

  	// Post data to AMT server
  	// http://www.jb51.net/article/75819.htm
  	function postData(url,params){
  		var temp=document.createElement("form");
  		temp.action=url;
  		temp.method="post";
  		temp.style.display="none";
  		for(var x in params){
  			var opt=document.createElement("textarea");
  			opt.name=x;
  			opt.value=params[x];
  			temp.appendChild(opt);
  		}
  		document.body.appendChild(temp);
  		temp.submit();
  		return temp;
  	}

    /*
     * Submit, undo, cancel
     */

    function btnFunc() {
        submit.onclick = function() {

          if(checkBoxes()){
            if ($(magnifyIcon).hasClass('magnifyIcon')) {
              destroy();
            }

            var websocket=new WebSocket(wsurl);
            var jsonstr="";

            //Called on error
            websocket.onerror=function(){
              alert("Something went wrong...");
            }

			//Called on message
			websocket.onmessage=function(event){
				if(event.data=="ok"){

          //Post data to AMT ExternalSubmit server
          postData("https://workersandbox.mturk.com/mturk/externalSubmit",
            {
              assignmentId:GetURLParam("assignmentId"),
              workerAnswer:jsonstr
            }
          );
        }else{
          alert("The server returned a error: "+event.data);
        }
        websocket.close();
			}

			//Called on close
			websocket.onclose=function(){
			}

			//Auto close connection on exit
			window.onbeforeunload=function(){
				websocket.close();
			}

            //Called on connection established
            websocket.onopen=function(){
              function convert(val, prop) {
                  /*
                   * val: The CSS value of the `prop` parameter below
                   * prop: The CSS property (width or height)
                   */
                  return Math.round(val * tempImg[prop] / image.children[0][prop]);
              }

              var tempImg=new Image();
              tempImg.src=g.imgVal;

              var jsonObj={
                msgtype:"submit",
                assignmentId:GetURLParam("assignmentId"),
                hitId:GetURLParam("hitId"),
                workerId:GetURLParam("workerId"),
                imgFile:g.imgVal,
                nwidth:tempImg.width,
                nheight:tempImg.height,
                rects:[]
              }

              for(i=1,length=image.children.length;i<length;i++){
                var imageRect = image.children[0].getBoundingClientRect();
                var boxRect = image.children[i].getBoundingClientRect();
                var x = Math.abs(boxRect.left - imageRect.left);
                var y = Math.abs(boxRect.top - imageRect.top);
                var temp={
                  num:i,
                  type:image.children[i].children[0].innerHTML,
                  width:convert(image.children[i].offsetWidth, 'width'),
                  height:convert(image.children[i].offsetHeight, 'height'),
                  x:convert(x, 'width'),
                  y:convert(y, 'height')
                }
                jsonObj.rects.push(temp);
              }
              jsonstr=JSON.stringify(jsonObj);
              console.log(jsonstr);
              websocket.send(jsonstr);

            }

          }
        };
        undo.onclick = function() {
            if (checkBoxes()) {
                image.removeChild(image.children[image.children.length - 1]);
            }
            changeCountBoxes(-1);
        };
        cancel.onclick = removeBoxes;
    }
    btnFunc();

    /*
     * Delete all boxes when the browser window is resized
     */
    function resize() {
        window.onload = function() {
            g.imagePos = image.getBoundingClientRect();
        };

        function adjust() {
            if ($(magnifyIcon).hasClass('magnifyIcon') && checkBoxes()) {
                magnifyIcon.click();
            }
            if (g.bool) {
                image.style.margin = '0 auto';
            } else {
                image.style.margin = 'auto';
            }
            g.bool = !g.bool;
        }
        window.addEventListener('resize', adjust);
    }
    resize();
})();
