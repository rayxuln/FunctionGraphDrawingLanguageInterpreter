
export class DFA {
    constructor(start_state, transition_table, final_states){
        this.start_state = start_state
        this.transition_table = transition_table
        this.final_states = final_states
    }

    move(state, next, input_str){
        if(next >= input_str.length) return -2 //尾部无转移
        let char = input_str[next]
        //获取state状态的出边
        let transitions = this.transition_table[state]
        for(let tran of transitions)
        {
            //判断state状态是否可由char转移到另一个状态
            if(tran.condition(char))
            {
                //返回转移到的状态
                return tran.to_state
            }
        }
        //若未发生状态转移则
        return -1
    }

    //输入为下一个字符的位置和待识别的字符串
    run(next, input_str){
        let state = this.start_state
        //首先试探一下从初态能否转移到其他状态
        let first = this.move(state, next, input_str)
        if(first == -1) return [-2, next];//无转移，非法字符
        if(first == -2) return [state, next];//遇到输入尾部，输入为空
        while(true)
        {
            let new_state = this.move(state, next, input_str)
            if(new_state < 0)//无转移，结束
            {
                if(this.final_states.indexOf(state) !== -1)
                {
                    return [state, next];//返回识别字符串的尾部
                }
                return [-1, next];//无法识别的字符串
            }
            state = new_state
            next += 1
        }
    }

}