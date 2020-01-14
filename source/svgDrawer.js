
let xml  = require("xmlParser");
let ParseStyle=function(string)
{
    let out = {};
    let key = "";
    let value = "";
    let readingKey = true;
    string += ";"
    for(let i = 0;i < string.length;i++)
    {
        let char = string[i];
        if(readingKey)
        {
            if(char == ':')
            {
                readingKey = false;
            }
            else
            {
                key += char;
            }
        }
        else
        {
            if(char == ';')
            {
                out[key] = value;
                readingKey = true;
                key = "";
                value = "";
            }
            else
            {
                value += char;
            }
        }
    }
    return out;
}

let readNumber=function(at,string)
{
    let out = {};
    let data = "";
    for(let i = at;i < string.length; i++)
    {
        let char = string[i];
        if(char != " " && char != ",")
        {
            data += char;
        }
        else
        {
            out.value = parseFloat(data);
            out.jumpTo = i;
            if(isNaN(out.value))
            {
                console.log(data)
            }
            return out;
        }
    }
    out.value = 0;
    out.jumpTo = string.length;
    return out;
}

let readPoint=function(at,string)
{
    let out = {};
    let x = readNumber(at,string);
    at = x.jumpTo;
    if(string[at] == ",") {at++};
    let y = readNumber(at,string);

    out.value = [x.value,y.value];
    out.jumpTo = y.jumpTo;
    return out;
}

let ParsePoly=function(string)
{
    let out = [];
    let cursor = [0,0];
    let argumentStarts = ["-","0",".","1","2","3","4","5","6","7","8","9"]
    let lastCommand = "l";
    for(let i = 0; i < string.length; i++)
    {
        let command = string[i];
        if(command != " ")
        {
            if(argumentStarts.includes(command))
            {
                command = lastCommand;
            }
            else
            {
                i++;
                for(; i < string.length; i++) { if(string[i]!= " ") { break; } }
                lastCommand = command;        
            }
            switch(command)
            {
                case "h":
                    {
                        let dx = readNumber(i,string);
                        i = dx.jumpTo;
                        cursor[0] += dx.value;
                        out.push([cursor[0],cursor[1]]);
                    }
                    break;
                case "H":
                    {
                        let x = readNumber(i,string);
                        i = x.jumpTo;
                        cursor[0] = x.value;
                        out.push([cursor[0],cursor[1]]);
                    }
                    break;
                    
                case "v":
                    {
                        let dy = readNumber(i,string);
                        i = dy.jumpTo;
                        cursor[1] += dy.value;
                        out.push([cursor[0],cursor[1]]);
                    }
                    break;
                case "V":
                    {
                        let y = readNumber(i,string);
                        i = y.jumpTo;
                        cursor[1] = y.value;
                        out.push([cursor[0],cursor[1]]);
                    }
                    break;

                case "m":
                    {
                        let d = readPoint(i,string);
                        i = d.jumpTo;
                        cursor[0] += d.value[0];
                        cursor[1] += d.value[1];
                        out.push([cursor[0],cursor[1]]);
                        lastCommand = "l";
                    }
                    break;
                case "M":
                    {
                        let d = readPoint(i,string);
                        i = d.jumpTo;
                        cursor[0] = d.value[0];
                        cursor[1] = d.value[1];
                        out.push([cursor[0],cursor[1]]);
                        lastCommand = "L"
                    }
                    break;
                
                case "L":
                    {
                        let d = readPoint(i,string);
                        i = d.jumpTo;
                        cursor[0] = d.value[0];
                        cursor[1] = d.value[1];
                        out.push([cursor[0],cursor[1]]);
                    }
                    break;

                case "l":
                    {
                        let d = readPoint(i,string);
                        i = d.jumpTo;
                        cursor[0] += d.value[0];
                        cursor[1] += d.value[1];
                        out.push([cursor[0],cursor[1]]);
                    }
                    break;
                    
                case "C":
                    {
                        let c1 = readPoint(i,string);
                        i = c1.jumpTo + 1;
                        let c2 = readPoint(i,string);
                        i = c2.jumpTo + 1;
                        let t = readPoint(i,string);
                        i = t.jumpTo;
                        
                        out = out.concat(BezierFragment(5,[cursor, c1.value,c2.value,t.value]))

                        cursor[0] = t.value[0];
                        cursor[1] = t.value[1];
                        //out.push([cursor[0],cursor[1]]);
                    }
                    break;
                    
                case "c":
                    {
                        let c1 = readPoint(i,string);
                        i = c1.jumpTo + 1;
                        let c2 = readPoint(i,string);
                        i = c2.jumpTo + 1;
                        let t = readPoint(i,string);
                        i = t.jumpTo;
                        
                        c1.value[0] += cursor[0];
                        c1.value[1] += cursor[1];
                        c2.value[0] += cursor[0];
                        c2.value[1] += cursor[1];
                        t.value[0] += cursor[0];
                        t.value[1] += cursor[1];
                        out = out.concat(BezierFragment(5,[cursor, c1.value,c2.value,t.value]))
                        cursor[0] = t.value[0];
                        cursor[1] = t.value[1];
                        //out.push([cursor[0],cursor[1]]);
                    }
                    break;

                case "z":
                case "Z":
                    out.push(_.first(out));
                    break;
            }
        }
    }
    return out;
}

let ParseColor=function(color,opacity)
{
    let result = color;
    if(!color || color == "none")
    {
        result = "#00000000"
    }
    else
    {
        result += ((opacity || 1)*255).toString(16)
    }
    return result;
}

let ParseSVG=function(fileName)
{
    let data = require(fileName);
    let object = xml.parseFromString(""+data)

    let out = [];
    object.forEach((element) =>
    {
        if(element.type == "element")
        {

            switch(element.tagName.replace("\n",""))
            {
            case "rect":
                {

                    let layer = {};
                    layer.type = VISUALTYPE_RECT
                    let attr = element.attributes;
                    layer.x = attr.x;
                    layer.y = attr.y;
                    layer.width = attr.width;
                    layer.height = attr.height;
                    
                    let style = ParseStyle(attr.style);
                    
                    layer.fill = ParseColor(style.fill, style["fill-opacity"])
                    layer.opacity = 1;

                    layer.stroke = ParseColor(style.stroke, style["stroke-opacity"]);
                    layer.strokeWidth = style["stroke-width"];
                    out.push(layer)
                }
                break;
            case "path":
                {
                    let layer = {};
                    layer.type = VISUALTYPE_POLY
                    let attr = element.attributes;
                    layer.poly = ParsePoly(attr.d)
                    
                    let style = ParseStyle(attr.style);
                    
                    layer.fill = ParseColor(style.fill, style["fill-opacity"])
                    layer.opacity =  style["fill-opacity"]||1;
                    console.log("base: " + style["fill-opacity"] + "\tloaded opacity: " + layer.opacity + "\tcolor: " + layer.fill)
                    layer.stroke = ParseColor(style.stroke, style["stroke-opacity"]);
                    
                    layer.strokeWidth = style["stroke-width"];
                    out.push(layer)
                }
                break;
            case "circle":
                {
                    let layer = {};
                    layer.type = VISUALTYPE_CIRCLE
                    let attr = element.attributes;
                    layer.x = parseFloat(attr.cx)
                    layer.y = parseFloat(attr.cy)
                    layer.radius = parseFloat(attr.r);
                    
                    let style = ParseStyle(attr.style);
                    
                    layer.fill = ParseColor(style.fill, style["fill-opacity"])
                    layer.opacity = 1;
                    layer.stroke = ParseColor(style.stroke, style["stroke-opacity"]);
                    
                    layer.strokeWidth = style["stroke-width"];
                    out.push(layer)
                }
                break;
            }
        }
    })
    return out;
}

let LoadedSVGS = {};
RoomVisual.prototype.DrawSvg=function(x,y,filePath,opt={})
{
    _.defaults(opt,{scale:1,alpha:1})
    if(!LoadedSVGS[filePath])
    {
        if(Game.cpu.getUsed() > SVG_DRAWER_CPU_LIMIT && Game.cpu.bucket > SVG_DRAWER_BUCKET_LIMIT)
        {
            LoadedSVGS[filePath] = ParseSVG(filePath);
            console.log("streaming " + filePath)
        }
        else
        {
            return;
        }
    }

    LoadedSVGS[filePath].forEach((layer) =>
        {
            switch(layer.type)
            {
            case VISUALTYPE_POLY:
                {
                    let args = {}
                    args.fill = layer.fill;
                    args.stroke = layer.stroke;
                    args.strokeWidth =  layer.strokeWidth;
                    args.opacity = layer.opacity * opt.alpha;
                    
                    this.poly(layer.poly.map(p => [ p[0]*opt.scale + x, p[1]*opt.scale + y ]),args);
                }
                break;
            case VISUALTYPE_RECT:
                {
                    let args = {};
                    args.fill = layer.fill;
                    args.stroke = layer.stroke;
                    args.strokeWidth =  layer.strokeWidth;
                    args.opacity = layer.opacity * opt.alpha;
                    
                    this.rect(layer.x*opt.scale+x,layer.y*opt.scale+y,layer.width*opt.scale,layer.height*opt.scale,args)
                }
                break;
            case VISUALTYPE_CIRCLE:
                {
                    let args = {};
                    args.fill = layer.fill;
                    args.opacity = layer.opacity*opt.alpha;
                    args.stroke = layer.stroke;
                    args.strokeWidth =  layer.strokeWidth;
                    args.radius = layer.radius;

                    this.circle(layer.x*opt.scale+x,layer.y*opt.scale+y,args)
                }
                break;
            }
        })
}