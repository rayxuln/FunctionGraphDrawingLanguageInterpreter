
import { RaiixTest } from "./RaiixTest.js"

export class Vector {
    constructor() {
        this.components = []
        if(arguments.length > 0)
        {
            if(typeof arguments[0] === "number")
            {
                for(let arg of arguments){
                    this.components.push(arg)
                }
            }else if(arguments[0].constructor == Array)
            {
                for(let c of arguments[0])
                {
                    this.components.push(c)
                }
            }
        }
        
    }

    get x(){
        return this.components[0]
    }
    set x(v){
        this.components[0] = v
    }

    get y(){
        return this.components[1]
    }
    set y(v){
        this.components[1] = v
    }

    get z(){
        return this.components[2]
    }
    set z(v){
        this.components[2] = v
    }

    get w(){
        return this.components[3]
    }
    set w(v){
        this.components[3] = v
    }

    get r(){
        return this.components[0]
    }
    set r(v){
        this.components[0] = v
    }

    get g(){
        return this.components[0]
    }
    set g(v){
        this.components[0] = v
    }

    get b(){
        return this.components[0]
    }
    set b(v){
        this.components[0] = v
    }

    get a(){
        return this.components[0]
    }
    set a(v){
        this.components[0] = v
    }

    get size(){
        return this.components.length
    }

    add(B){
        let A = this
        let res = new Vector(A.components.length <= B.components.length ? A.components : B.components)
        for(let i=0; i<res.components.length; ++i)
        {
            res.components[i] = A.components[i] + B.components[i]
        }
        return res
    }

    minus(){
        let res = new Vector(this.components)
        for(let i=0; i<res.components.length; ++i)
        {
            res.components[i] = -res.components[i]
        }
        return res
    }

    sub(B){
        let A = this
        return A.add(B.minus())
    }

    product(B){
        let A = this
        if(typeof B === "number")
        {
            let res = new Vector(A.components )
            for(let i=0; i<res.components.length; ++i)
            {
                res.components[i] = A.components[i] * B
            }
            return res
        }else if(B.constructor == Vector)
        {
            let res = new Vector(A.components.length <= B.components.length ? A.components : B.components)
            for(let i=0; i<res.components.length; ++i)
            {
                res.components[i] = A.components[i] * B.components[i]
            }
            return res
        }
        console.error("null vector!")
        return new Vector()
    }

    cross(B){
        let A = this
        if(A.size < 3 || B.size < 3){
            console.error("wrong size of vector!")
            return
        }
        let res = new Vector(0, 0, 0)
        res.x = A.y*B.z - A.z*B.y
        res.y = A.z*B.x - A.x*B.z
        res.z = A.x*B.y - A.y*B.x
        return res
    }

    dot(B){
        let A = this
        let size = Math.min(A.components.length, B.components.length)
        let res = 0
        for(let i=0; i<size; ++i)
        {
            res += A.components[i] * B.components[i]
        }
        return res
    }

    equal(B){
        let A = this
        if(A.components.length != B.components.length) return false
        for(let i=0; i<A.components.length; ++i)
        {
            if(A.components[i] !== B.components[i])
                return false
        }
        return true
    }

    asign(B){
        if(arguments.length > 1)
        {
            B = new Vector(Array.from(arguments))
        }else if(B.constructor == Array)
        {
            B = new Vector(B)
        }
        let A = this
        A.components = []
        for(let c of B.components){
            A.components.push(c)
        }
        return A
    }

    length(){
        let size = this.components.length
        if(size <= 0) return 0
        let sum = 0
        for(let c of this.components)
        {
            sum += c*c
        }
        let res = Math.sqrt(sum)
        return res
    }

    normalized(){
        let res = new Vector(this.components)
        let l = res.length()
        for(let i=0; i<res.components.length; ++i)
        {
            res.components[i] /= l
        }
        return res
    }

    toString(){
        let res = '['
        for(let i=0; i<this.components.length; ++i)
        {
            res += this.components[i]
            if(i < this.components.length-1){
                res += ", "
            }
        }
        res += ']'
        return res
    }

    static ZERO2(){
        return new Vector(0, 0)
    }

    static ZERO3(){
        return new Vector(0, 0, 0)
    }

    static V(){
        return new Vector(Array.from(arguments))
    }

    static UP(){
        return new Vector(0, 1, 0)
    }

    static RIGHT(){
        return new Vector(1, 0, 0)
    }

    static FRONT(){
        return new Vector(0, 0, 1)
    }

    static WHITE(){
        return new Vector(0, 0, 0, 1)
    }

    static RED(){
        return new Vector(1, 0, 0, 1)
    }

    static GREEN(){
        return new Vector(0, 1, 0, 1)
    }

    static BLUE(){
        return new Vector(0, 0, 1, 1)
    }
}

export class VectorTest extends RaiixTest {
    constructor(){
        super("VectorTest")
        var that = this
        this.enable = false
        this.cases = {
            test_zero(){
                that.assert(Vector.ZERO2().equal(Vector.ZERO2()))
            },
            test_equal_1(){
                that.assert(new Vector(1, 2).equal(new Vector(1, 2)))
            },
            test_equal_2(){
                that.assert_equal(new Vector(2, 2), (new Vector(2, 2)))
            },
            test_not_equal_1(){
                that.assert(!(new Vector(2, 2).equal(new Vector(1, 2))))
            },
            test_not_equal(){
                that.assert_equal(Vector.ZERO2().add(new Vector(1, 2)).equal(new Vector(1, 3)), false)
            },
            test_add_1(){
                that.assert_equal(new Vector(1, 1).add(new Vector(1, 1)), new Vector(2, 2))
            },
            test_minus_1(){
                that.assert_equal(new Vector(1, 2).minus(), new Vector(-1, -2))
            },
            test_sub_1(){
                that.assert_equal(new Vector(1, 1).add(new Vector(2, 0)).sub(new Vector(3, 1)), Vector.ZERO2())
            },
            test_product_1(){
                that.assert_equal(new Vector(1, 0).product(3), new Vector(3, 0))
            },
            test_product_2(){
                that.assert_equal(new Vector(1, 0).product(new Vector(3, 10)), new Vector(3, 0))
            },
            test_product_3(){
                that.assert_equal(new Vector(1, 3).product(new Vector(3, 2)), new Vector(3, 6))
            },
            test_asign_1(){
                let A = Vector.ZERO2()
                let B = new Vector(3, 2)
                A.asign(B)
                that.assert_equal(A, B)
            },
            test_asign_2(){
                let A = Vector.ZERO2()
                let B = new Vector(3, 2)
                A.asign(3, 2)
                that.assert_equal(A, B)
            },
            test_asign_3(){
                let A = Vector.ZERO2()
                let B = new Vector(3, 2)
                A.asign([3, 2])
                that.assert_equal(A, B)
            },
            test_length_1(){
                that.assert_equal(Vector.V(3, 4, 0).length(), 5)
            },
            test_normalized_1(){
                that.assert_equal(Math.round(Vector.V(999, 233).normalized().length()), 1)
            },
            test_cross_1(){
                that.assert_equal(Vector.V(0, 0, 1).cross(Vector.V(1, 0, 0)), Vector.V(0, 1, 0))
            },
            test_dot_1(){
                that.assert_equal(Vector.V(3, 2, 1).dot(Vector.V(1, 0, 3)), 6)
            }
        }
    }
}