


export function RaiixEnumType()
{
    let res = {}
    let id_cnt = 0

    res.__name__ = {}

    for(let arg of arguments)
    {
        res[arg] = id_cnt++
        res.__name__[res[arg]] = arg
    }

    res.to_string = function(x){return res.__name__[x]}

    return res
}