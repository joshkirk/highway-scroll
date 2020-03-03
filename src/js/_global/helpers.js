/*
 	Has Class

	Returns true/false if element has classname.
-------------------------------------------------- */
export const hasClass = (element, cls)=>{
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
};

/*
 	Vanilla .eq()

	Returns element by index.

	Usage: eq.call(arrayOfElements, index);
-------------------------------------------------- */
export const eq = (index)=>{
	if(index >= 0 && index < this.length){
		return this[index];
	} else {
		return -1;
    }
};

/*
 	Vanilla array remove
-------------------------------------------------- */
export const remove = (array, element)=>{
	return array.filter(e => e !== element);
};


/*
	Get Viewport

	returns the native height and width of the
	browser viewport.
-------------------------------------------------- */
export const getViewport = function(){
	let e = window, a = 'inner';
	if(!('innerWidth' in window)){
		a = 'client';
		e = document.documentElement || document.body;
	}
	return { width : e[ a+'Width' ] , height : e[ a+'Height' ] };
};
