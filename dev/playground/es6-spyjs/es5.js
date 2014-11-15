require('./underscore')
function Foo() {
    this.bar = true
}

var foo = new Foo()
var str = ''
console.log(foo.each)
foo.a = false
