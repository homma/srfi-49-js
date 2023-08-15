#### About

[SRFI 49](https://srfi.schemers.org/srfi-49/srfi-49.html) ported to JavaScript

#### Example

````lisp
$ node ./transpile.mjs factorial.iexp 
( define  (fac x)  ( if  (= x 0)  1  ( *  x  ( fac  (- x 1) ) ) ) )
````

````lisp
$ node ./test_srfi_49.mjs                     
( define  ( fac  x )  ( if  ( =  x  0 )  1  ( *  x  ( fac  ( -  x  1 ) ) ) ) )
( let  ( ( foo  ( +  1  2 ) )  ( bar  ( +  3  4 ) ) )  ( +  foo  bar ) )
( define  (fac x)  ( if  (= x 0)  1  ( *  x  ( fac  (- x 1) ) ) ) )
( let  ( ( foo  (+ 1 2) )  ( bar  (+ 3 4) ) )  ( +  foo  bar ) )
````
