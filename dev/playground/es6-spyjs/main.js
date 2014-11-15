class Foo {
    constructor() {
        this.bar = true
    }
}
var foo = new Foo()
for (var v of foo) {
    console.log(v)
}