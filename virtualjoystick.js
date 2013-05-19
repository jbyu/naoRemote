
var VirtualJoystick	= function(opts)
{
	opts			= opts			|| {};
	this._container		= opts.container	|| document.body;
	this._stickEl		= opts.stickElement	|| this._buildJoystickStick();
	this._baseEl		= opts.baseElement	|| this._buildJoystickBase();
	this._mouseSupport	= 'mouseSupport' in opts? opts.mouseSupport	: false;
	this._range		= opts.range		|| 60;

	//this._container.style.position	= "relative";

	this._container.appendChild(this._baseEl);
	this._baseEl.style.position	= "absolute"
	this._baseEl.style.display	= "none";
	
	this._container.appendChild(this._stickEl);
	this._stickEl.style.position	= "absolute"
	this._stickEl.style.display	= "none";
	
	this._pressed	= false;
	this._baseX	= 0;
	this._baseY	= 0;
	this._stickX	= 0;
	this._stickY	= 0;

	__bind		= function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
	this._$onTouchStart	= __bind(this._onTouchStart	, this);
	this._$onTouchEnd	= __bind(this._onTouchEnd	, this);
	this._$onTouchMove	= __bind(this._onTouchMove	, this);
	this._container.addEventListener( 'touchstart'	, this._$onTouchStart	, false );
	this._container.addEventListener( 'touchend'	, this._$onTouchEnd	, false );
	this._container.addEventListener( 'touchmove'	, this._$onTouchMove	, false );
	if( this._mouseSupport ){
		this._$onMouseDown	= __bind(this._onMouseDown	, this);
		this._$onMouseUp	= __bind(this._onMouseUp	, this);
		this._$onMouseMove	= __bind(this._onMouseMove	, this);
		this._container.addEventListener( 'mousedown'	, this._$onMouseDown	, false );
		this._container.addEventListener( 'mouseup'	, this._$onMouseUp	, false );
		this._container.addEventListener( 'mousemove'	, this._$onMouseMove	, false );
	}
}

VirtualJoystick.prototype.destroy	= function()
{
	this._container.removeChild(this._baseEl);
	this._container.removeChild(this._stickEl);

	this._container.removeEventListener( 'touchstart'	, this._$onTouchStart	, false );
	this._container.removeEventListener( 'touchend'		, this._$onTouchEnd	, false );
	this._container.removeEventListener( 'touchmove'	, this._$onTouchMove	, false );
	if( this._mouseSupport ){
		this._container.removeEventListener( 'mouseup'		, this._$onMouseUp	, false );
		this._container.removeEventListener( 'mousedown'	, this._$onMouseDown	, false );
		this._container.removeEventListener( 'mousemove'	, this._$onMouseMove	, false );
	}
}

/**
 * @returns {Boolean} true if touchscreen is currently available, false otherwise
*/
VirtualJoystick.touchScreenAvailable	= function()
{
	return 'createTouch' in document ? true : false;
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype.deltaX	= function(){ return this._stickX - this._baseX;	}
VirtualJoystick.prototype.deltaY	= function(){ return this._stickY - this._baseY;	}

VirtualJoystick.prototype.up	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaY >= 0 )	return false;
	if( Math.abs(deltaY) < this._range && Math.abs(deltaY) < Math.abs(deltaX) ){
		return false;
	}
	return true;
}
VirtualJoystick.prototype.down	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaY <= 0 )	return false;
	if( Math.abs(deltaY) < this._range && Math.abs(deltaY) < Math.abs(deltaX) ){
		return false;
	}
	return true;	
}
VirtualJoystick.prototype.right	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaX <= 0 )	return false;
	if( Math.abs(deltaX) < this._range && Math.abs(deltaY) > Math.abs(deltaX) ){
		return false;
	}
	return true;	
}
VirtualJoystick.prototype.left	= function(){
	if( this._pressed === false )	return false;
	var deltaX	= this.deltaX();
	var deltaY	= this.deltaY();
	if( deltaX >= 0 )	return false;
	if( Math.abs(deltaX) < this._range && Math.abs(deltaY) > Math.abs(deltaX) ){
		return false;
	}
	return true;	
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._onUp	= function()
{
	this._pressed	= false; 
	this._stickEl.style.display	= "none";
	this._baseEl.style.display	= "none";
	
	this._baseX	= this._baseY	= 0;
	this._stickX	= this._stickY	= 0;
	
	this._container.cbEnd();
}

VirtualJoystick.prototype._onDown	= function(x, y)
{
	this._pressed	= true; 
	this._baseX	= x;
	this._baseY	= y;
	this._stickX	= x;
	this._stickY	= y;

	this._stickEl.style.display	= "";
	this._stickEl.style.left	= (x - this._stickEl.width /2)+"px";
	this._stickEl.style.top		= (y - this._stickEl.height/2)+"px";

	this._baseEl.style.display	= "";
	this._baseEl.style.left		= (x - this._baseEl.width /2)+"px";
	this._baseEl.style.top		= (y - this._baseEl.height/2)+"px";
	
	this._container.cbBegin();
}

VirtualJoystick.prototype._onMove	= function(x, y)
{
	if( this._pressed === true ){
		this._stickX	= x;
		this._stickY	= y;
		this._stickEl.style.left	= (x - this._stickEl.width /2)+"px";
		this._stickEl.style.top		= (y - this._stickEl.height/2)+"px";
	}
}


//////////////////////////////////////////////////////////////////////////////////
//		bind touch events (and mouse events for debug)			//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._onMouseUp	= function(event)
{
	return this._onUp();
}

VirtualJoystick.prototype._onMouseDown	= function(event)
{
	var x	= event.clientX;
	var y	= event.clientY;
	return this._onDown(x, y);
}

VirtualJoystick.prototype._onMouseMove	= function(event)
{
	var x	= event.clientX;
	var y	= event.clientY;
	return this._onMove(x, y);
}

function getRectangle(obj){
    var topValue= 0,leftValue= 0;
	rect = {}
	rect.w = obj.offsetWidth;
	rect.h = obj.offsetHeight;
    while(obj) {
		leftValue+= obj.offsetLeft;
		topValue+= obj.offsetTop;
		obj= obj.offsetParent;
    }
	rect.x = leftValue;
	rect.y = topValue;
    return rect;
}

VirtualJoystick.prototype._onTouchStart	= function(event)
{
//	if( event.touches.length != 1 )	return;
	event.preventDefault();
	var rect = getRectangle(this._container);
	for (i=0;i<event.touches.length;i++)
	{
		var x	= event.touches[ i ].pageX;
		var y	= event.touches[ i ].pageY;
		var dx = x - rect.x;
		var dy = y - rect.y;
		if (dx > 0 && dx < rect.w && dy > 0 && dy < rect.h) 
		{
			this._index = i;
			return this._onDown(x, y)
		}
	}
	//return this._onDown(x, y)
}

VirtualJoystick.prototype._onTouchEnd	= function(event)
{
	//??????
	// no preventDefault to get click event on ios
	event.preventDefault();
	return this._onUp()
}

VirtualJoystick.prototype._onTouchMove	= function(event)
{
	if( event.touches.length <= this._index )	return;

	event.preventDefault();

	var x	= event.touches[ this._index ].pageX;
	var y	= event.touches[ this._index ].pageY;
	return this._onMove(x, y)
}


//////////////////////////////////////////////////////////////////////////////////
//		build default stickEl and baseEl				//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._buildJoystickBase	= function()
{
	var canvas	= document.createElement( 'canvas' );
	canvas.width	= 126;
	canvas.height	= 126;
	
	var ctx		= canvas.getContext('2d');
	ctx.beginPath(); 
	ctx.strokeStyle = "cyan"; 
	ctx.lineWidth	= 6; 
	ctx.arc( canvas.width/2, canvas.width/2, 40, 0, Math.PI*2, true); 
	ctx.stroke();	

	ctx.beginPath(); 
	ctx.strokeStyle	= "cyan"; 
	ctx.lineWidth	= 2; 
	ctx.arc( canvas.width/2, canvas.width/2, 60, 0, Math.PI*2, true); 
	ctx.stroke();
	
	return canvas;
}

VirtualJoystick.prototype._buildJoystickStick	= function()
{
	var canvas	= document.createElement( 'canvas' );
	canvas.width	= 86;
	canvas.height	= 86;
	var ctx		= canvas.getContext('2d');
	ctx.beginPath(); 
	ctx.strokeStyle	= "cyan"; 
	ctx.lineWidth	= 6; 
	ctx.arc( canvas.width/2, canvas.width/2, 40, 0, Math.PI*2, true); 
	ctx.stroke();
	return canvas;
}

VirtualJoystick.prototype._buildJoystickButton	= function()
{
	var canvas	= document.createElement( 'canvas' );
	canvas.width	= 86;
	canvas.height	= 86;
	var ctx		= canvas.getContext('2d');
	ctx.beginPath(); 
	ctx.strokeStyle	= "red"; 
	ctx.lineWidth	= 6; 
	ctx.arc( canvas.width/2, canvas.width/2, 40, 0, Math.PI*2, true); 
	ctx.stroke();
	return canvas;
}
