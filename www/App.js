import { ScannerTest } from "./lib/Scanner.js"
import { ParserTest } from "./lib/Parser.js"
import { InterpreterTest, Interpreter } from "./lib/Interpreter.js"
import { Vector } from "./lib/Vector.js"

export default class {
    constructor(context){
        this.context = context;

        this.interpreter = new Interpreter(this.context)
    }

    retain_image_data()
    {
    }

    async init(){
        //await (new ScannerTest()).run()
        //await (new ParserTest()).run()
        //await (new InterpreterTest()).run()

        this.retain_image_data();
        this.eval();
    }

    eval(){
        // 清屏
        this.context.canvas.height = this.context.canvas.height
        this.context.fillStyle = '#f0f0f0';
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);

        // 获取代码文本
        let code_container = document.getElementById("code-container")
        let code = code_container.value
        
        // 执行代码
        this.interpreter.eval(code)
    }
}