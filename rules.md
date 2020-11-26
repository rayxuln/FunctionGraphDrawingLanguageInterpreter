# 函数绘图语言

## Token类型

```json
"CONST", "VAR",
"ORIGIN", "SCALE", "ROT", "IS", "TO", "STEP", "DRAW", "FOR", "FROM",
"PLUS", "MINUS", "MUL", "DIV", "POW",
"SEMICO", "L_BRANCKET", "R_BRANCKET", "COMMA",
"ERR",
"EOF",
"COMMENT"
```

其中:

- `CONST`为常量，它的值由记号表给定，储存在Token中
- `VAR`为变量，它的值在符号表中指定，Token只储存它的标识符
- 函数视为一个值，同数字一样。但函数可调用，并传递若干个参数
- 操作符将在语法分析中解析为函数调用，它的函数在记号表中给定

## 记号表(TokenTable)

用于将识别到的字符串转换成相应的Token，以及给常量指定值和给内置函数、操作符指定相应的函数

## 符号表(SymbolTable)

由运行时生成，用于存放变量的值。在语句执行期间会使用到它，比如读写变量。

## 词法规则

```json
CONST = IDENTIFIER
VAR = IDENTIFIER
IDENTIFIER = letter (letter | digit)*
NUMBER = digit+ ("." digit*)?
ORIGIN = "ORIGIN"
SCALE = "SCALE"
ROT = "ROT"
IS = "IS" 
TO = "TO" 
STEP = "STEP" 
DRAW = "DRAW" 
FOR = "FOR" 
FROM = "FROM"
PLUS = "+" 
MINUS = "-" 
MUL = "*" 
DIV = "/" 
POW = "**"
SEMICO = ";" 
L_BRANCKET = "(" 
R_BRANCKET = ")" 
COMMA = ","
COMMENT = "--" | "//"
```

## 语法规则

```palin
Program -> { Statement SEMICO }
Statement -> Originstatement
           | Scalestatement
           | Rotstatement
           | Forstatement

Originstatement -> ORIGIN IS L_BRANCKET Expression COMMA Expression R_BRANCKET

Scalestatement -> SCALE IS IS L_BRANCKET Expression COMMA Expression R_BRANCKET

Rotstatement -> ROT IS Expression

Forstatement -> FOR Var FROM Expression TO Expression STEP Expression DRAW L_BRANCKET Expression COMMA Expression R_BRANCKET

Expression -> Term { (PLUS | MINUS) Term }
Term       -> Factor { (MUL | DIV) Factor}
Factor     -> (PLUS | MINUS) Factor | Component
Component  -> Atom [POW Component]
Atom       -> (CONST | VAR | L_BRANCKET Expression R_BRANCKET) [L_BRANCKET ARGS R_BRANCKET]

Var  -> VAR
Args -> Expression { , Args }


```
