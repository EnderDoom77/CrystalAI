//MUST SAVE VARIABLES: cleanseDefault, prefix, prefixCaseSensitive

const Discord = require('discord.js');
const bot = new Discord.Client;

const MySQL = require('mysql');

const token = "Njk5MjMzMzU5NTc4MjY3NzM5.XpRgoQ.5-LiZ1dXXaSoaDZArp0piKqfqmo";
const link = "https://discordapp.com/api/oauth2/authorize?client_id=699233359578267739&permissions=1546775638&scope=bot"
let prefix = ':';

bot.login(token); 

bot.on('ready', () => {
    console.log("Hi! I'm Crystal, how may I help you?")
})

const MESSAGEHELP = new Discord.MessageEmbed()
    .setTitle("Command List for Crystal AI")
    .addField("Basic commands", "help => Will show this message \nhelp [command] => Will show how to use a specific command \nhelloworld => Hi! \ninvite => Will show you how to add me to your server! ^w^")
    .addField("Fun commands", "roll [dice] => Will roll some dice! use help roll for more info.\nmath [operation] => Will solve an arithmetic calculation.")
    .addField("Moderation commands", "cleanse (n) => Will bulk delete n messages")
    .addField("Config commands", "setprefix [prefix] => Will set the prefix \ntoggleprefixcasesensitive => Will toggle whether any case is accepted for the prefix")
    .setColor("0xAA33FF");
let cleanseDefault = 1;
let prefixCaseSensitive = false;

bot.on('message', msg => {
    
    if(msg.content.toLowerCase() == ":crystalresetprefix")
    {
        if(!msg.member.permissions.has(32))
            {
                msg.reply("You're not allowed to use this command!").then(msg => {msg.delete({timeout: 3000})});
            }

        msg.channel.send(`Prefix successfully reset to ":"`)
        prefix = ':';
    }
    
    if(!(msg.content.substring(0, prefix.length) == prefix || (!prefixCaseSensitive && msg.content.substring(0, prefix.length).toLowerCase() == prefix.toLowerCase())))
    {
        return;
    }

    let args = msg.content.substring(prefix.length).split(" ");

    for(let arg in args)
    {
        if(args[arg][0] == "\"" && args.length > arg + 1)
        {
            args[arg] += " " + args.pop(arg + 1);
            args[arg] = args[arg].substring(1, args[arg].length - 1)
        }
    }

    switch(args[0].toLowerCase())
    {
        case 'help':
        case 'h':
            if(args.length == 1)
            {
                msg.channel.send(MESSAGEHELP);
            }
            else
            {
                switch(args[1].toLowerCase())
                {
                    case 'help':
                    case 'h':
                        msg.channel.send(MESSAGEHELP);
                    case 'invite':
                        msg.channel.send("Use this command to invite me to your server! ^w^");
                        break;
                    case 'cleanse':
                        msg.channel.send("Syntax: [prefix]cleanse [number] Use: I will delete that many messages!")
                        break;
                    case 'roll':
                        const embedRoll = new Discord.MessageEmbed().setTitle(`${prefix}roll [n]d[D] ([+ or -] [mod])`)
                        .addField("Usage", "It will roll dice as you indicat on the command.")
                        .addField("n", "Indicates the total number of dice. If negative, it will add negative numbers", true)
                        .addField("D", "The maximum value the dice can roll (number of faces per die)")
                        .addField("mod", "A flat value to add or subtract to the final roll")
                        .setColor("0xAA33FF");

                        msg.channel.send(embedRoll);
                        break;
                    case 'math':
                    case 'calc':
                    case 'maths':
                        const embedMath = new Discord.MessageEmbed().setTitle(`${prefix}math [operation] ([options])`)
                        .addField("Usage", "It will try to evaluate a given arithmetic expression")
                        .addField("Options", "-v or --verbose : includes a traceback of operations as well as dice results.")
                        .addField("Aliases", "maths, calc")
                        .addField("Allowed functions and operators", "() : parentheses\nmax, min : multiparameter functions e.g. max(abs(-3), pi)\nsqrt, sin, cos, tan, arcsin, arccos, arctan, log, ln, abs. e.g. sin(2pi), log2_(32^2)\n^ % d : expontiation, remainder and dice-rolling.\n\* and / : multiplication and division\n + and - : addition and subtraction")
                        .addField("Recognised constants:", "pi, phi, e")
                        .setColor("0xAA33FF");

                        msg.channel.send(embedMath);
                        break;
                    default:
                        msg.channel.send(`Sorry! I couldn't find command: "${args[1]}" >~<`);
                        break;
                }
            }
            break;
        case 'cleanse':
            if(!msg.member.permissions.has(8192))
            {
                msg.reply("You're not allowed to use this command!").then(msg => {msg.delete({timeout: 3000})});
                break;
            }

            let n = (args.length > 1 ? parseInt(args[1]) : cleanseDefault);
            msg.channel.bulkDelete(n + 1);
            msg.channel.send(`Cleansed the last ${n == 1 ? "message" : n + " messages"}.`).then(msg => {msg.delete({timeout: 3000})});
            break;
        case 'invite':
            msg.channel.send("Wowww you want to add me to a server? I'm flattered. Check this link out! \n" + link);
            break;
        case 'helloworld':
            msg.channel.send("Hi there! I'm Crystal, how may I help you today?");
            break;
        case 'roll':
            args.shift();
            let output = TryRoll(ClumpArray(args, ""), msg.member );

            if(output == false)
            {
                msg.reply("Sorry! I don't understand! Please use the following format: `roll [number of dice]d[die face count] ([+ or -] [modifier])`").then(msg => {msg.delete(3000)});
                break;
            }

            msg.channel.send(output);
            break;
        case 'check': //:check [SOME ACTION] [OPTIONS] ==> -mod+3 -adv -disadv
            args.shift();

            let finishedOptions = false;
            let advantage = 0;
            let mod = 0;

            try{
                while(!finishedOptions)
                {
                    finishedOptions = true;

                    if(StartsWith(args[args.length - 1]), "-mod") 
                    {
                        mod = mathevalStart(args[args.length - 1].substring("-mod".length));
                        if(isNaN(mod)) msg.reply(`The modifier you used (${args[args.length - 1].substring("-mod".length)}) can't be evaluated! ${mod}`).then(msg => (msg.delete(6000)))
                        finishedOptions = false;
                        args.pop();
                    }
                    switch(args[args.length - 1])
                    {
                        case "-adv":
                        case "--advantage":
                            advantage = 1;
                            finishedOptions = false;
                            break;
                        case "-disadv":
                        case "--disadvantage":
                            advantage = -1;
                            finishedOptions = false;
                            break;
                    }
                }
            }
            catch(err)
            {
                msg.reply(`An unexpected error has occurred! ${err}`);
            }

            if(args.length < 1)
            {
                msg.reply("You must include an action!").then(msg => {msg.delete({timeout: 3000})});
                break;
            }

            msg.channel.send()

            break;
        case 'setprefix':
            if(!msg.member.permissions.has(32))
            {
                msg.reply("You're not allowed to use this command!").then(msg => {msg.delete({timeout: 3000})});
                break;
            }

            if(args.length < 2)
            {
                msg.reply("You must include a prefix!").then(msg => {msg.delete({timeout: 3000})});
                break;
            }

            prefix = args[1];
            msg.channel.send(`Prefix successfully changed to "${prefix}", to reset this change, type ":crystalresetprefix"`);
            break;
        case 'toggleprefixacceptcaps':
        case 'toggleprefixcasesensitive':
            if(!msg.member.permissions.has(32))
            {
                msg.reply("You're not allowed to use this command!").then(msg => {msg.delete({timeout: 3000})});
                break;
            }

            prefixCaseSensitive = !prefixCaseSensitive;
            msg.channel.send(`The prefix I use (${prefix}) ${prefixCaseSensitive ? "won't" : "will"} admit variations in capitalisation.`);
            break;
        case 'math':
        case 'maths':
        case 'calc':
            args.shift();

            let finishedOptions = false;
            let verbose = false;

            while(!finishedOptions)
            {
                finishedOptions = true;

                if(args[args.length - 1] == "-v" || args[args.length - 1] == "--verbose") 
                {
                    verbose = true;
                    finishedOptions = false; 
                    args.pop();
                }
            }

            if(args.length < 1)
            {
                msg.reply("You must include an operation!").then(msg => {msg.delete({timeout: 3000})});
                break;
            }

            msg.channel.send(math(ClumpArray(args, ""), verbose));
            break;
    }
})

function TryRoll(input, author)
{
    let n = 1;
    let dSeparatorIndex = 0;
    let d = 4;
    let mod = 0;

    let foundMod = false;
    let foundD = false;

    for (let i = 0; i < input.length; i++) {
        const element = input[i];
        
        if(element === "d" || element === "D")
        {
            foundD = true;
            if(i == 0)
            {
                n = 1;
            }
            else
            {
                n = parseInt(input.substring(0, i));
            }
            dSeparatorIndex = i;
        }
        else if ((element === "+" || element === "-") && dSeparatorIndex != 0) {
            foundMod = true;
            d = parseInt(input.substring(dSeparatorIndex + 1, i));
            mod = parseInt(input.substring(i + 1)) * (element === "-" ? -1 : 1);
        }
    }

    if(! foundMod)
    {
        d = parseInt(input.substr(dSeparatorIndex + 1));
    }

    if(! foundD || d == NaN || n == NaN || mod == NaN)
    {
        return false;
    }

    return RollDiceEmbed(n, d, mod, author);
}

function RollDice(n, d, mod, author)
{
    console.log(`rolling dice with parameters n = ${n}, d = ${d}, mod = ${mod}`);

    const separator = " + "

    let numbers = new Array(Math.abs(n));
    let rolls = "";
    let modifier = "";
    let result = 0;

    for (let i = 0; i < Math.abs(n); i++) {
        numbers[i] = (Math.floor(Math.random() * d) + 1) * (n < 0 ? -1 : 1);
        if(numbers[i] === d && d >= 20)
        {
            rolls += numbers[i] + "!" + separator;
            //rolls += ` <span class="highlight-crit">${numbers[i]}</span> + `;
        }
        else if(numbers[i] === 1 && d >= 20)
        {
            rolls += numbers[i] + "!" + separator;
            //rolls += ` <span class="highlight-fail">${numbers[i]}</span> + `;
        }
        /*else if(numbers[i] === 1)
        {
            //rolls += ` <span class="font-red">${numbers[i]}</span> + `;
        }*/
        else
        {
        rolls += numbers[i] + separator;
        }
    }

    rolls = rolls.substring(0, rolls.length - separator.length);
    modifier = "(" + (mod < 0 ? "-" : "+") + Math.abs(mod) + ")";

    result = Add(numbers) + mod;

    return `${rolls} ${modifier} = ${result}`;
}

function RollDiceEmbed(n, d, mod, author)
{
    let embed = new Discord.MessageEmbed();
    let result = mod;
    let modifierText = `\(${mod < 0 ? "-" : "+"}${Math.abs(mod)})`;

    let totalResult = "";
    const separator = " + "

    for (let i = 0; i < Math.abs(n); i++) {
        let newNum = (Math.floor(Math.random() * d) + 1) * (n < 0 ? -1 : 1)
        result += newNum;
        let newStr = "";
        
        if(newNum === d && d > 12)
        {
            newStr += `__***${newNum}!***__` 
        }
        else if(newNum === 1 && d > 12)
        {
            newStr += `__**${newNum}**__`
        }
        else if(newNum === 1)
        {
            newStr += `**${newNum}**`
        }
        else
        {
            newStr += newNum.toString();
        }

        totalResult += newStr + separator;

        if(n <= 21)
        {
        embed.addField(`d${d}`, newStr, true);
        }
    }

    if(n > 21)
    {
        totalResult = totalResult.substring(0, totalResult.length - separator.length)
        embed.addField("Rolls:", totalResult);
    }

    embed.addField("mod", modifierText)
    .setTitle(result)
    .setDescription(`${n !== 1 ? n : ""}d${d} ${modifierText} => ${result}`)
    .setColor("0xFF0000")
    .setFooter(`${author.displayName}`, author.iconURL);

    return embed;
}

function RollDiceSilent(n, d)
{
    let newNum = 0;
    let value = 0;

    for (let i = 0; i < Math.abs(n); i++) {

        newNum = (Math.floor(Math.random() * d) + 1) * (n < 0 ? -1 : 1);

        value += newNum;
        traceback += newNum + "+";
    }

    if(traceback[traceback.length - 1] == "+") traceback = traceback.substring(0, traceback.length - 1);
    traceback += n > 1 ? `=${value}]; ` : "]; ";
    return value;
}

function ClumpArray(array, separator)
{
    let output = "";
    
    for(let element of array)
    {
        output += separator + element;
    }

    if(output.length >= separator.length)
    {
        output = output.substr(separator.length);
    }

    return output;
}

function Add(list)
{
    let result = 0;

    list.forEach(n => {
        result += n;
    });

    return result;
}

function StartsWith(string, substring)
{
    return ContainsAt(string, substring, 0);
}

function ContainsAt(string, substring, position)
{
    if(string.length < substring.length + position)
    {
        return false;
    }

    for(let i = 0; i < substring.length; i++)
    {
        if(string[i + position] != substring[i]) return false;
    }

    return true;
}

let traceback = "";
function math(input, includeTraceback = true)
{
    traceback = "";
    let output = mathevalStart(input);
    let outputSimp = Math.round(output * 10000) / 10000;
    let embed = new Discord.MessageEmbed();

    embed.addField(`**${input}**`, isNaN(outputSimp) ? output : outputSimp)
    .setColor(StartsWith(output, "ERROR:") ? "0xFF0055" : "0x00FF55");

    if(includeTraceback)
    {
        embed.addField("Traceback", traceback);
    }

    return embed;
}

function mathevalStart(input)
{
    input = input.toLowerCase();
    newInput = "";

    for(let i = 0; i < input.length; i++)
    {
        const c = input[i];

        if(c == "-")
        {
            newInput += "―";
        }
        else if(c == "(" && i > 0)
        {
            if(input[i-1] >= '0' && input[i-1] <= '9')
            {
                newInput += "*(";
            }
            else
            {
                newInput += "(";
            }
        }
        else if(c == ")" && i + 1 < input.length)
        {
            if(input[i+1] >= '0' && input[i+1] <= '9')
            {
                newInput += ")*";
            }
            else
            {
                newInput += ")";
            }
        }
        else
        {
            newInput += input[i];
        }
    }

    return matheval(newInput);
}

function matheval(input, basePos = 0)
{
    const pi = Math.PI;
    const e = Math.E;
    const phi = 1.61803398875;

    console.log("Math with input " + input);

    input = input.toString().trim();

    if(input == "") return `ERROR: Empty at position: ${basePos};`;
    else if(StartsWith(input, "ERROR: "))
    {
        traceback += `Forwarding ${input}; `;
        return input;
    }
    else if(StartsWith(input, "["))
    {
        return input;
    }

    let a = "";
    let b = "";

    let par = 0; //number of closed parantheses found till all are opened.
    let pos = 0; //position of the last parenthesis

    for(let ch = input.length; ch >= 0; ch--) //Brackets
    {
        if(input[ch] == ")") {
            par++;
            if(par == 1) pos = ch;
        }

        if(input[ch] == "(") {
            par--;
            if(par == 0) 
            {
                let content = input.substring(ch + 1, pos);

                if(input.includes(",")) {
                    let args = []
                    let final = []
                    
                    args = input.substring(ch + "(".length, pos).split(",");
                    let intCh = 0;

                    for(let i = 0; i < args.length; i++)
                    {
                        final.push(matheval(args[i], basePos + ch + intCh));
                        intCh += args[i].length + ",".length;
                    }
                    
                    input = input.substring(0, ch) + `[${ClumpArray(final, ";")}]` + input.substring(pos + 1);
                    traceback += `Extracted commas into ${input} at: ${ch + basePos}; `
                }
                else
                {
                a = matheval(content, pos + basePos + 1);
                
                if(StartsWith(a, "ERROR"))
                {
                    return a + "\n Within brackets;";
                }

                input = input.substring(0, ch) + a + input.substring(pos + 1);
                traceback += `Interpreted brackets into "${input}" : ${ch + basePos}; `;
                }
            }
        }
    }

    for(let ch = input.length; ch >= 0; ch--) //Addition & Subtraction
    {
        if(input[ch] == "+" || input[ch] == "―")
        {
            a = matheval(input.substring(0, ch), basePos);
            b = matheval(input.substring(ch + 1), basePos + ch + 1);

            if(StartsWith(a, "ERROR: Empty"))
            {
                a = 0;
            }

            if(StartsWith(a, "ERROR:"))
            {
                traceback += `forwarding ${a} from ${(input[ch] == "―") ? "subtraction" : "addition"}; `;
                return `${a}\nAt ${input[ch] == "―" ? "minuend;" : "augend;"}`;
            }
            else if(StartsWith(b, "ERROR:"))
            {
                traceback += `forwarding ${b} from ${(input[ch] == "―") ? "subtraction" : "addition"}; `;
                console.log(`Returning addend error as "${b}\nAt ${input[ch] == "―" ? "subtrahend;" : "addend;"}" from b = ${b} and input = ${input}`)
                return `${b}\nAt ${input[ch] == "―" ? "subtrahend;" : "addend;"}`;
            }

            traceback += `Interpreted ${(input[ch] == "―") ? "subtraction" : "addition"} (${a}${input[ch]}${b}) : ${basePos + ch}; `;
            return a + (b * (input[ch] == "―" ? (-1) : (1)));
        }
    }

    for(let ch = input.length; ch >= 0; ch--) //Multiplication & Division
    {
        if(input[ch] == "*" || input[ch] == "/")
        {
            a = matheval(input.substring(0, ch), basePos);
            b = matheval(input.substring(ch + 1), basePos + ch + 1);

            if(StartsWith(a, "ERROR:"))
            {
                traceback += `forwarding ${a} from ${input[ch] == "/" ? "division" : "multiplication"}; `
                return a + `\n At ${input[ch] == "/" ? "dividend" : "multiplicand"};`;
            }
            else if(StartsWith(b, "ERROR:"))
            {
                traceback += `forwarding ${b} from ${input[ch] == "/" ? "division" : "multiplication"}; `
                return b + `\n At ${input[ch] == "/" ? "divisor" : "multiplier"};`;
            }

            if(b == 0 && input[ch] == "/") return `ERROR: Attempt to divide by 0 UNDEFINED at position: ${basePos + ch}`

            traceback += `Interpreted ${input[ch] == "/" ? "division :" : "multiplication :"} (${a}${"\\"+input[ch]}${b}) : ${basePos + ch}; `;
            return a * (b ** (input[ch] == "/" ? (-1) : (1)));
        }
    }

    for(let ch = input.length; ch >= 0; ch--) //Exponentiation
    {
        if(input[ch] == "^")
        {
            a = matheval(input.substring(0, ch), basePos);
            b = matheval(input.substring(ch + 1), basePos + ch + 1);

            if(StartsWith(a, "ERROR:"))
            {
                traceback += `forwarding ${a} from exponentiation; ` 
                return a + "\n At base;";
            }
            else if(StartsWith(b, "ERROR:"))
            {
                traceback += `forwarding ${b} from exponentiation; ` 
                return b + "\n At exponent;";
            }

            if(a == 0 && b == 0) return `ERROR: Attempt to do 0^0 UNDEFINED at position: ${basePos + ch}`

            traceback += `Interpreted exponentiation (${a}^${b}) : ${basePos}; `;
            return a ** b;
        }
    }

    for(let ch = input.length; ch >= 0; ch--) //Remainder
    {
        if(input[ch] == "%")
        {
            a = matheval(input.substring(0, ch), basePos);
            b = matheval(input.substring(ch + 1), basePos + ch + 1);

            if(StartsWith(a, "ERROR:"))
            {
                traceback += `forwarding ${a} from remainder; `
                return a + "\n At remainder dividend;";
            }
            else if(StartsWith(b, "ERROR:"))
            {
                traceback += `forwarding ${b} from remainder; `
                return b + "\n At remainder divisor;";
            }

            traceback += `Interpreted remainder (${a} % ${b}) : ${basePos + ch}; `;
            return a % b;
        }
    }

    for(let ch = input.length; ch >= 0; ch--) //Dice-rolling
    {
        if(input[ch] == "d")
        {
            a = matheval(input.substring(0, ch), basePos);
            b = matheval(input.substring(ch + 1), basePos + ch + 1);

            if(StartsWith(a, "ERROR: Empty"))
            {
                a = 1;
            }

            if(StartsWith(a, "ERROR:"))
            {
                traceback += `forwarding ${a} from dice-rolling; `
                return a + "\n At Dice-Rolling dice count;";
            }
            else if(StartsWith(b, "ERROR:"))
            {
                traceback += `forwarding ${a} from dice-rolling; `
                return b + "\n At Dice-Rolling die type;";
            }

            traceback += `Interpreted dice-rolling (${a}d${b}) : ${basePos + ch} with results: [`
            return RollDiceSilent(a, b);
        }
    }
        
    const functions = ["sqrt" , "sin", "cos", "tan", "ln", "log", "arcsin", "arccos", "arctan", "abs", "max", "min"];
    const functionAction = [Math.sqrt, Math.sin, Math.cos, Math.tan, Math.log, Math.log10, Math.asin, Math.acos, Math.atan, Math.abs, Math.max, Math.min];

    for(let ch = input.length; ch >= 0; ch--)
    {
        for(let func in functions)
        {
            if(ContainsAt(input, functions[func], ch))
            {
                a = matheval(input.substring(0, ch), basePos);
                b = matheval(input.substring(ch + functions[func].length), basePos + ch + functions[func].length);

                console.log(`Interpreting ${functions[func]} function (${a}\*${functions[func]}(${b})) : ${basePos + ch}; `)

                let logBase = 10;

                if(StartsWith(a, "ERROR: Empty"))
                {
                    a = 1;
                }
                else if(StartsWith(a, "ERROR:"))
                {
                    traceback += `forwarding ${a} from function (${functions[func]}); `
                    return a + `\n At function (${functions[func]}) multiplicand;`;
                }

                if(StartsWith(b, "ERROR: Found underscore") && functions[func] == "log")
                {
                    let str = input.substring(ch + functions[func].length).split("_");
                                            
                    logBase = matheval(str[0], basePos + ch + functions[func].length);
                    b = matheval(str[1], basePos + ch + functions[func].length + str[0].length + 1);

                    if(StartsWith(logBase, "ERROR:"))
                    {
                        return logBase + "\n At log base;";
                    }
                    else if(StartsWith(b, "ERROR:"))
                    {
                        return b + "\n At log argument;";
                    }       
                }
                else if(StartsWith(b, "ERROR:"))
                {
                    traceback += `forwarding ${b} from function (${functions[func]}); `
                    return b + `\n At function (${functions[func]}) argument;`;
                }

                if(StartsWith(b, "[") && (functions[func] == "max" || functions[func] == "min"))
                {
                    let args = []
                    
                    args = input.substring(ch + functions[func].length + "[".length).split(";");

                    let argsParsed = new Array();

                    for(let i = 0; i < args.length; i++)
                    {
                        argsParsed.push(parseFloat(args[i]));
                    }    

                    console.log("Parsing commas from args array " + args + " into " + argsParsed + " with type of " + typeof argsParsed);
                    console.log(Math.max.apply(this, argsParsed));

                    traceback += `Interpreted ${functions[func]} function (${a}\*${functions[func]}(${b})) : ${basePos + ch}; `
                    return a * functionAction[func].apply(this, argsParsed);
                }

                traceback += `Interpreted ${functions[func]} function (${a}\*${functions[func]}(${b})) : ${basePos + ch}; `
                return a * functionAction[func](b) / Math.log10(logBase);
            }
        }
    }

    const c = ["pi", "e", "phi"]
    const cv = [pi, e, phi]

    for(let ch = input.length; ch >= 0; ch--)
    {
        for(let i = 0; i < c.length; i++)
        {
            if(ContainsAt(input, c[i], ch))
            {
                a = matheval(input.substring(0, ch), basePos);
                b = matheval(input.substring(ch + c[i].length), basePos + ch + c[i].length);

                if(StartsWith(a, "ERROR: Empty"))
                {
                    a = 1;
                }
                else if(StartsWith(a, "ERROR:"))
                {
                    return a + `\n At constant (${c[i]}) multiplicand;`;
                }
                if(!StartsWith(b, "ERROR: Empty"))
                {
                    return `ERROR: Unexpected value after constant (${c[i]}) at position: ${(basePos + ch + c[i].length)};`;
                }

                traceback += `Interpreted constant (${c[i]}) : ${basePos + ch}; `
                return a * cv[i];
            }
        }
    }

    if(input.includes("_")) return `ERROR: Found underscore at construction starting at position: ${basePos}`;

    const value = parseFloat(input);

    if(isNaN(value))
    {
        return `ERROR: Couldn't parse expression "${input}" at position: ${basePos}`;
    }
    else
    {
        traceback += `Parsed value (${value}) from "${input}" : ${basePos}; `
        return value;
    }
}