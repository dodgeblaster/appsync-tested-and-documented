module.exports.handler = async () => {
    let result = ''
    const characters = [
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        'abcdefghijklmnopqrstuvwxyz',
        '0123456789',
        '!@#$%&'
    ]
    for (let i = 0; i < 14; i++) {
        const char = characters[i % 4]
        result += char.charAt(Math.floor(Math.random() * char.length))
    }
    return result
}
