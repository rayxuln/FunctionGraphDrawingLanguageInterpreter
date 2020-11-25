import { ScannerTest } from "./lib/Scanner.js"
import { Vector } from "./lib/Vector.js"

export default class {
    constructor(context){
        this.context = context;
        this.image_data = null;
    }

    // 清屏
    clear_image_data(image_data, color)
    {
        let color_size = Math.min(4, color.components.length)
        for(let i=0; i<image_data.data.length; i+=4)
        {
            for(let x=0; x<color_size; ++x)
            {
                image_data.data[i+x] = Math.round(color.components[x] * 255)
            }
        }
    }

    // Color 为浮点数[0, 1]
    set_pixel_at(pos, color)
    {
        let i = (Math.floor(pos.y)*this.image_data.width + Math.floor(pos.x))*4
        let color_size = Math.min(4, color.components.length)
        for(let x=0; x<color_size; ++x)
        {
            this.image_data.data[i+x] = Math.round(color.components[x] * 255)
        }

    }

    // 创建一张可以自定义像素的图片
    retain_image_data()
    {
        this.image_data = this.context.createImageData(this.context.canvas.width, this.context.canvas.height);
    }

    async init(){
        //await (new ScannerTest()).run()

        this.retain_image_data();
        this.eval();
    }

    eval(){
        // 清屏
        this.context.fillStyle = '#aaaaaa';
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.clear_image_data(this.image_data, new Vector(0.9, 0.9, 0.9, 1))

        // 逐个渲染像素

        // 写入画布数据
        if(this.image_data)
            this.context.putImageData(this.image_data, 0, 0)
    }
}