export class RaiixTest {
    constructor(test_name){
        var that = this
        this.cases = {
        }
        this.test_name = test_name
        this.enable = true
    }

    run(){
        if(!this.enable) return
        let total_num = Object.keys(this.cases).length
        let cnt = 1
        for(let func in this.cases)
        {
            console.log(">["+ cnt++ +"/"+total_num+"]==== Test " + this.test_name + " For " + func + " ====")
            try{
                this.cases[func]()
            }catch(err){
                console.log(err)
                continue
            }
            console.log("Passed!")
        }
    }

    assert(exp){
        this.assert_equal(exp, true)
    }

    assert_not_equal(exp1, exp2)
    {
        if(exp1 === exp2 && (exp1.equal == undefined || exp1.equal(exp2)))
        {
            throw Error("assert fail! \nleft: " + exp1 + "\nright: " + exp2)
        }
    }

    assert_equal(exp1, exp2){
        if(exp1 !== exp2 && (exp1.equal == undefined || !exp1.equal(exp2)))
        {
            throw Error("assert fail! \nleft: " + exp1 + "\nright: " + exp2)
        }
    }
}