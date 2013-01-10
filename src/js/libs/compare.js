function recursiveCompare(a, b) {
	// return a list of strings standing for the position of different elements in an object/array
	//assume only these types of arguments will be passed here: string, number, date, array, boolean, regexp
	// this method utilizes recursion (momumomu KanadeT!)
	//result will look like  [ 'Array:2 --> Array:0 --> str-error'
	if (a === b) {
		return [] ; //undefinded and null can be treated by ==, = =
	}

	else {
		if (typeof a != typeof b) {
		 return ['type-error']
		}

		else {
			if (a instanceof Date){
				if ( !(b instanceof Date) ) return ['type-error']
				if ( a.toString() == b.toString() ) return[] 
				else return ['date-error']
			}

			else if (a instanceof RegExp){
				if (!(b instanceof RegExp))  return ['type-error'] 
				if (a.toString() == b.toString()) return [] 
				else return ['reg-error']
			}

			else if (a instanceof Number){
				if(isNaN(a)&&isNaN(b)) return [] // NaN cannot be treated by ==, = =
				return ['num-error']
			}
			else if (a instanceof String){
				//stringified JSON support are added here
				try {
					var temp =[]
					recursiveCompare( eval(a), eval(b)).forEach( function (index, element, array) {
						temp.push( 'str --> '+ element)
					})
					return temp
				}
				catch return ['str-error']
			}
			else if(typeof a == 'boolean'){
				return ['bln-error']
			}

			//recursion starts!
			else if(a instanceof Array){
				if (!(b instanceof Array)) return ['type-error']
				var temp = []
				//deal with two arrays with different length
				if(a.length != b.length){
					var mark=[]
					for(var i=0; i<a.length; i++) {
						for(var j=0;j<b.length;j++){
							if ( mark.indexOf(j)!= -1) { continue } //skip checked element
							if ( recursiveCompare(a[i],b[j]).length==0) {
								mark.push(j)
								break
							}
							if (j == b.length -1) temp.push('a-uniIndex' + i) //add the index of unique element at last
						}
					}
					for ( var j=0;j<b.length;j++){
						mark.indexOf(j) == -1 && temp.push('b-uniIndex-'+j)
					}
					return temp
				}

				a.forEach( function (element, index, array){
					/*compare every element in a with its counterpart in b
					the comparison uses recursiveCompare itself
					*/
					recursiveCompare( element, b[index]).forEach( function (e,i,arr) {
					// compare a[index] with b[index]
					//remember the result is a list. add index before each element in the result 
					// then push the modified one into temp
						temp.push( 'Array: '+index+ ' --> ' + e) //notice, the index of element in a is neeed here, not that i in result
					})
				})
				return temp
			}

			else if(typeof a == 'object'){ 
				//ignore other types, such as function
				if (a==null||b==null) return['null-error'] //deal with null
				//only care about enumberable property here
				temp = []
				for (var k in a){
					b.hasOwnProperty(k) || temp.push('a-uniKey'+k)
				}
				for (var k in b){
					a.hasOwnProperty(k) || temp.push('b-uniKey'+k)
				}

				if (temp.length!=0) return temp

				for (var k in a){
					recursiveCompare(a[k],b[k]).forEach( function (e,i,arr){
						temp.push( 'Key: '+ k+ ' --> '+ e)
					})
				}
				return temp
			}

			else return ['input-error']

		}
	}
}
