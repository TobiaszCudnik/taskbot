///<reference path="../underscore/underscore" />

interface ObjectStatic {

	/**
	* Retrieve all the names of the object's properties.
	* @param object Retrieve the key or property names from this object.
	* @return List of all the property names on `object`.
	**/
	keys(object: any): string[];

	/**
	* Return all of the values of the object's properties.
	* @param object Retrieve the values of all the properties on this object.
	* @return List of all the values on `object`.
	**/
	values(object: any): any[];

	/**
	* Convert an object into a list of [key, value] pairs.
	* @param object Convert this object to a list of [key, value] pairs.
	* @return List of [key, value] pairs on `object`.
	**/
	pairs(object: any): any[][];

	/**
	* Returns a copy of the object where the keys have become the values and the values the keys.
	* For this to work, all of your object's values should be unique and string serializable.
	* @param object Object to invert key/value pairs.
	* @return An inverted key/value paired version of `object`.
	**/
	invert(object: any): any;

	/**
	* Returns a sorted list of the names of every method in an object - that is to say,
	* the name of every function property of the object.
	* @param object Object to pluck all function property names from.
	* @return List of all the function names on `object`.
	**/
	functions(object: any): string[];

	/**
	* @see _functions
	**/
	methods(object: any): string[];

	/**
	* Copy all of the properties in the source objects over to the destination object, and return
	* the destination object. It's in-order, so the last source will override properties of the
	* same name in previous arguments.
	* @param destination Object to extend all the properties from `sources`.
	* @param sources Extends `destination` with all properties from these source objects.
	* @return `destination` extended with all the properties from the `sources` objects.
	**/
	extend(
		destination: Object,
		...sources: Object[]): Object;

	/**
	* Return a copy of the object, filtered to only have values for the whitelisted keys
	* (or array of valid keys).
	* @param object Object to strip unwanted key/value pairs.
	* @keys The key/value pairs to keep on `object`.
	* @return Copy of `object` with only the `keys` properties.
	**/
	pick(
		object: any,
		...keys: string[]): any;

	/**
	* Return a copy of the object, filtered to omit the blacklisted keys (or array of keys).
	* @param object Object to strip unwanted key/value pairs.
	* @param keys The key/value pairs to remove on `object`.
	* @return Copy of `object` without the `keys` properties.
	**/
	omit(
		object: any,
		...keys: string[]): any;

	/**
	* @see _.omit
	**/
	omit(
		object: any,
		keys: string[]): any;

	/**
	* Fill in null and undefined properties in object with values from the defaults objects,
	* and return the object. As soon as the property is filled, further defaults will have no effect.
	* @param object Fill this object with default values.
	* @param defaults The default values to add to `object`.
	* @return `object` with added `defaults` values.
	**/
	defaults(
		object: any,
		...defaults: any[]): any;

	/**
	* Create a shallow-copied clone of the object.
	* Any nested objects or arrays will be copied by reference, not duplicated.
	* @param object Object to clone.
	* @return Copy of `object`.
	**/
	clone(object: T): Object;

	/**
	* Invokes interceptor with the object, and then returns object. The primary purpose of this method
	* is to "tap into" a method chain, in order to perform operations on intermediate results within the chain.
	* @param object Argument to `interceptor`.
	* @param intercepter The function to modify `object` before continuing the method chain.
	* @return Modified `object`.
	**/
	tap(object: T, intercepter: Function): Object;

	/**
	* Does the object contain the given key? Identical to object.hasOwnProperty(key), but uses a safe
	* reference to the hasOwnProperty function, in case it's been overridden accidentally.
	* @param object Object to check for `key`.
	* @param key The key to check for on `object`.
	* @return True if `key` is a property on `object`, otherwise false.
	**/
	has(object: any, key: string): boolean;

	/**
	* Returns a predicate function that will tell you if a passed in object contains all of the key/value properties present in attrs.
	* @param attrs Object with key values pair
	* @return Predicate function
	**/
	matches<TResult>(attrs: T): _.ListIterator<TResult>;

	/**
	* Returns a function that will itself return the key property of any passed-in object.
	* @param key Property of the object.
	* @return Function which accept an object an returns the value of key in that object.
	**/
	property(key: string): (object: Object) => any;

	/**
	* Performs an optimized deep comparison between the two objects,
	* to determine if they should be considered equal.
	* @param object Compare to `other`.
	* @param other Compare to `object`.
	* @return True if `object` is equal to `other`.
	**/
	isEqual(object: any, other: any): boolean;

	/**
	* Returns true if object contains no values.
	* @param object Check if this object has no properties or values.
	* @return True if `object` is empty.
	**/
	isEmpty(object: any): boolean;

	/**
	* Returns true if object is a DOM element.
	* @param object Check if this object is a DOM element.
	* @return True if `object` is a DOM element, otherwise false.
	**/
	isElement(object: any): boolean;

	/**
	* Returns true if object is an Array.
	* @param object Check if this object is an Array.
	* @return True if `object` is an Array, otherwise false.
	**/
	isArray(object: any): boolean;

	/**
	* Returns true if value is an Object. Note that JavaScript arrays and functions are objects,
	* while (normal) strings and numbers are not.
	* @param object Check if this object is an Object.
	* @return True of `object` is an Object, otherwise false.
	**/
	isObject(object: any): boolean;

	/**
	* Returns true if object is an Arguments object.
	* @param object Check if this object is an Arguments object.
	* @return True if `object` is an Arguments object, otherwise false.
	**/
	isArguments(object: any): boolean;

	/**
	* Returns true if object is a Function.
	* @param object Check if this object is a Function.
	* @return True if `object` is a Function, otherwise false.
	**/
	isFunction(object: any): boolean;

	/**
	* Returns true if object is a String.
	* @param object Check if this object is a String.
	* @return True if `object` is a String, otherwise false.
	**/
	isString(object: any): boolean;

	/**
	* Returns true if object is a Number (including NaN).
	* @param object Check if this object is a Number.
	* @return True if `object` is a Number, otherwise false.
	**/
	isNumber(object: any): boolean;

	/**
	* Returns true if object is a finite Number.
	* @param object Check if this object is a finite Number.
	* @return True if `object` is a finite Number.
	**/
	isFinite(object: any): boolean;

	/**
	* Returns true if object is either true or false.
	* @param object Check if this object is a bool.
	* @return True if `object` is a bool, otherwise false.
	**/
	isBoolean(object: any): boolean;

	/**
	* Returns true if object is a Date.
	* @param object Check if this object is a Date.
	* @return True if `object` is a Date, otherwise false.
	**/
	isDate(object: any): boolean;

	/**
	* Returns true if object is a RegExp.
	* @param object Check if this object is a RegExp.
	* @return True if `object` is a RegExp, otherwise false.
	**/
	isRegExp(object: any): boolean;

	/**
	* Returns true if object is NaN.
	* Note: this is not the same as the native isNaN function,
	* which will also return true if the variable is undefined.
	* @param object Check if this object is NaN.
	* @return True if `object` is NaN, otherwise false.
	**/
	isNaN(object: any): boolean;

	/**
	* Returns true if the value of object is null.
	* @param object Check if this object is null.
	* @return True if `object` is null, otherwise false.
	**/
	isNull(object: any): boolean;

	/**
	* Returns true if value is undefined.
	* @param object Check if this object is undefined.
	* @return True if `object` is undefined, otherwise false.
	**/
	isUndefined(value: any): boolean;
}

interface Object {

	/**
	* @see _.each
	* @param object Iterates over properties of this object.
	* @param iterator Iterator function for each property on `object`.
	* @param context 'this' object in `iterator`, optional.
	**/
	each(
		iterator: _.ObjectIterator<Object, void>,
		context?: any): Object;

	/**
	* @see _.each
	**/
	forEach(
		iterator: _.ObjectIterator<Object, void>,
		context?: any): Object;

	/**
	* @see _.map
	* @param object Maps the properties of this object.
	* @param iterator Map iterator function for each property on `object`.
	* @param context `this` object in `iterator`, optional.
	* @return The mapped object result.
	**/
	map<TResult>(
		object: Object,
		iterator: _.ObjectIterator<TResult>,
		context?: any): TResult[];

	/**
	* @see _.map
	**/
	collect<TResult>(
		object: Object,
		iterator: _.ObjectIterator<TResult>,
		context?: any): TResult[];

	/**
	* Also known as inject and foldl, reduce boils down a list of values into a single value.
	* Memo is the initial state of the reduction, and each successive step of it should be
	* returned by iterator. The iterator is passed four arguments: the memo, then the value
	* and index (or key) of the iteration, and finally a reference to the entire list.
	* @param list Reduces the elements of this array.
	* @param iterator Reduce iterator function for each element in `list`.
	* @param memo Initial reduce state.
	* @param context `this` object in `iterator`, optional.
	* @return Reduced object result.
	**/
	reduce<TResult>(
		iterator: _.MemoIterator<TResult>,
		memo?: TResult,
		context?: any): TResult;

	/**
	* @see _.reduce
	**/
	inject<TResult>(
		iterator: _.MemoIterator<TResult>,
		memo?: TResult,
		context?: any): TResult;

	/**
	* @see _.reduce
	**/
	foldl<TResult>(
		iterator: _.MemoIterator<TResult>,
		memo?: TResult,
		context?: any): TResult;

	/**
	* The right-associative version of reduce. Delegates to the JavaScript 1.8 version of
	* reduceRight, if it exists. `foldr` is not as useful in JavaScript as it would be in a
	* language with lazy evaluation.
	* @param list Reduces the elements of this array.
	* @param iterator Reduce iterator function for each element in `list`.
	* @param memo Initial reduce state.
	* @param context `this` object in `iterator`, optional.
	* @return Reduced object result.
	**/
	reduceRight<TResult>(
		iterator: _.MemoIterator<TResult>,
		memo?: TResult,
		context?: any): TResult;

	/**
	* @see _.reduceRight
	**/
	foldr<TResult>(
		iterator: _.MemoIterator<TResult>,
		memo?: TResult,
		context?: any): TResult;

	/**
	* @see _.find
	**/
	find(
		iterator: _.ObjectIterator<boolean>,
		context?: any): Object;

	/**
	* @see _.find
	**/
	detect(
		iterator: _.ObjectIterator<boolean>,
		context?: any): Object;

	/**
	* @see _.filter
	**/
	filter(
		object: Object,
		iterator: _.ObjectIterator<boolean>,
		context?: any): T[];

	/**
	* @see _.filter
	**/
	select(
		object: Object,
		iterator: _.ObjectIterator<boolean>,
		context?: any): T[];

	/**
	* Looks through each value in the list, returning an array of all the values that contain all
	* of the key-value pairs listed in properties.
	* @param list List to match elements again `properties`.
	* @param properties The properties to check for on each element within `list`.
	* @return The elements within `list` that contain the required `properties`.
	**/
	where<U extends {}>(
		properties: U): T[];

	/**
	* Looks through the list and returns the first value that matches all of the key-value pairs listed in properties.
	* @param list Search through this list's elements for the first object with all `properties`.
	* @param properties Properties to look for on the elements within `list`.
	* @return The first element in `list` that has all `properties`.
	**/
	findWhere<U extends {}>(
		properties: U): Object;

	/**
	* Returns the values in list without the elements that the truth test (iterator) passes.
	* The opposite of filter.
	* Return all the elements for which a truth test fails.
	* @param iterator Reject iterator function for each element in `list`.
	* @param context `this` object in `iterator`, optional.
	* @return The rejected list of elements.
	**/
	reject(
		iterator: _.ObjectIterator<boolean>,
		context?: any): T[];

	/**
	* Returns true if all of the values in the list pass the iterator truth test. Delegates to the
	* native method every, if present.
	* @param iterator Trust test iterator function for each element in `list`.
	* @param context `this` object in `iterator`, optional.
	* @return True if all elements passed the truth test, otherwise false.
	**/
	every(
		iterator?: _.ObjectIterator<boolean>,
		context?: any): boolean;

	/**
	* @see _.every
	**/
	all(
		iterator?: _.ObjectIterator<boolean>,
		context?: any): boolean;

	/**
	* Returns true if any of the values in the list pass the iterator truth test. Short-circuits and
	* stops traversing the list if a true element is found. Delegates to the native method some, if present.
	* @param list Truth test against all elements within this list.
	* @param iterator Trust test iterator function for each element in `list`.
	* @param context `this` object in `iterator`, optional.
	* @return True if any elements passed the truth test, otherwise false.
	**/
	some(
		iterator?: _.ObjectIterator<boolean>,
		context?: any): boolean;

	/**
	* @see _.some
	**/
	any(
		object: Object,
		iterator?: _.ObjectIterator<boolean>,
		context?: any): boolean;

	/**
	* Returns true if the value is present in the list. Uses indexOf internally,
	* if list is an Array.
	* @param list Checks each element to see if `value` is present.
	* @param value The value to check for within `list`.
	* @return True if `value` is present in `list`, otherwise false.
	**/
	contains(
		value: T): boolean;

	/**
	* @see _.contains
	**/
	include(
		object: Object,
		value: T): boolean;

	/**
	* Calls the method named by methodName on each value in the list. Any extra arguments passed to
	* invoke will be forwarded on to the method invocation.
	* @param methodName The method's name to call on each element within `list`.
	* @param arguments Additional arguments to pass to the method `methodName`.
	**/
	invoke(
		methodName: string,
		...arguments: any[]): any;

	/**
	* A convenient version of what is perhaps the most common use-case for map: extracting a list of
	* property values.
	* @param list The list to pluck elements out of that have the property `propertyName`.
	* @param propertyName The property to look for on each element within `list`.
	* @return The list of elements within `list` that have the property `propertyName`.
	**/
	pluck<T extends {}>(
		propertyName: string): any[];

	/**
	* Returns the maximum value in list.
	* @param list Finds the maximum value in this list.
	* @return Maximum value in `list`.
	**/
	max(): number;

	/**
	* Returns the maximum value in list. If iterator is passed, it will be used on each value to generate
	* the criterion by which the value is ranked.
	* @param list Finds the maximum value in this list.
	* @param iterator Compares each element in `list` to find the maximum value.
	* @param context `this` object in `iterator`, optional.
	* @return The maximum element within `list`.
	**/
	max(
		iterator?: _.ListIterator<any>,
		context?: any): Object;

	/**
	* Returns the minimum value in list.
	* @param list Finds the minimum value in this list.
	* @return Minimum value in `list`.
	**/
	min(): number;

	/**
	* Returns the minimum value in list. If iterator is passed, it will be used on each value to generate
	* the criterion by which the value is ranked.
	* @param list Finds the minimum value in this list.
	* @param iterator Compares each element in `list` to find the minimum value.
	* @param context `this` object in `iterator`, optional.
	* @return The minimum element within `list`.
	**/
	min(
		iterator?: _.ListIterator<any>,
		context?: any): Object;

	/**
	* Returns a sorted copy of list, ranked in ascending order by the results of running each value
	* through iterator. Iterator may also be the string name of the property to sort by (eg. length).
	* @param list Sorts this list.
	* @param iterator Sort iterator for each element within `list`.
	* @param context `this` object in `iterator`, optional.
	* @return A sorted copy of `list`.
	**/
	sortBy<TSort>(
		iterator?: _.ListIterator<TSort>,
		context?: any): T[];

	/**
	* @see _.sortBy
	* @param iterator Sort iterator for each element within `list`.
	**/
	sortBy(
		iterator: string,
		context?: any): T[];

	/**
	* Splits a collection into sets, grouped by the result of running each value through iterator.
	* If iterator is a string instead of a function, groups by the property named by iterator on
	* each of the values.
	* @param list Groups this list.
	* @param iterator Group iterator for each element within `list`, return the key to group the element by.
	* @param context `this` object in `iterator`, optional.
	* @return An object with the group names as properties where each property contains the grouped elements from `list`.
	**/
	groupBy(
		iterator?: _.ListIterator<any>,
		context?: any): Object<T[]>;

	/**
	* @see _.groupBy
	* @param iterator Property on each object to group them by.
	**/
	groupBy(
		iterator: string,
		context?: any): Object<T[]>;

	/**
	* Given a `list`, and an `iterator` function that returns a key for each element in the list (or a property name),
	* returns an object with an index of each item.  Just like _.groupBy, but for when you know your keys are unique.
	**/
	indexBy(
		iterator: _.ListIterator<any>,
		context?: any): Object;

	/**
	* @see _.indexBy
	* @param iterator Property on each object to index them by.
	**/
	indexBy(
		iterator: string,
		context?: any): Object;

	/**
	* Sorts a list into groups and returns a count for the number of objects in each group. Similar
	* to groupBy, but instead of returning a list of values, returns a count for the number of values
	* in that group.
	* @param list Group elements in this list and then count the number of elements in each group.
	* @param iterator Group iterator for each element within `list`, return the key to group the element by.
	* @param context `this` object in `iterator`, optional.
	* @return An object with the group names as properties where each property contains the number of elements in that group.
	**/
	countBy(
		iterator?: _.ListIterator<any>,
		context?: any): Object<number>;

	/**
	* @see _.countBy
	* @param iterator Function name
	**/
	countBy(
		iterator: string,
		context?: any): Object<number>;

	/**
	* Returns a shuffled copy of the list, using a version of the Fisher-Yates shuffle.
	* @param list List to shuffle.
	* @return Shuffled copy of `list`.
	**/
	shuffle(): T[];

	/**
	* Produce a random sample from the `list`.  Pass a number to return `n` random elements from the list.  Otherwise a single random item will be returned.
	* @param list List to sample.
	* @return Random sample of `n` elements in `list`.
	**/
	sample(n: number): T[];

	/**
	* @see _.sample
	**/
	sample(): Object;

	/**
	* Converts the list (anything that can be iterated over), into a real Array. Useful for transmuting
	* the arguments object.
	* @param list object to transform into an array.
	* @return `list` as an array.
	**/
	toArray(): T[];

	/**
	* Return the number of values in the list.
	* @param list Count the number of values/elements in this list.
	* @return Number of values in `list`.
	**/
	size(): number;

	/**
	* Split array into two arrays:
	* one whose elements all satisfy predicate and one whose elements all do not satisfy predicate.
	* @param array Array to split in two.
	* @param iterator Filter iterator function for each element in `array`.
	* @param context `this` object in `iterator`, optional.
	* @return Array where Array[0] are the elements in `array` that satisfies the predicate, and Array[1] the elements that did not.
	**/
	partition(
		iterator: _.ListIterator<boolean>,
		context?: any): T[][];
}
