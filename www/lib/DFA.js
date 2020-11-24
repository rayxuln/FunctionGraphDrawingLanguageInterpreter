
export class DFA {
    constructor(start_state, transition_table, final_states){
        this.start_state = start_state
        this.transition_table = transition_table
        this.final_states = final_states
    }

    move(state, next, input_str){
        if(next >= input_str.length) return -2 //尾部无转移
        let char = input_str[next]
        let transitions = this.transition_table[state]
        for(let tran of transitions)
        {
            if(tran.condition(char))
            {
                return tran.to_state
            }
        }
        return -1
    }

    run(next, input_str){
        let state = this.start_state
        let first = this.move(state, next, input_str)
        if(first == -1) return [-2, next];//非法字符
        if(first == -2) return [state, next];//输入为空
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