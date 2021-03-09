const aws = require('aws-sdk')
const cognito = new aws.CognitoIdentityServiceProvider({
    region: process.env.AWS_REGION
})

module.exports.handler = async ({ email, password }) => {
    const params = {
        UserPoolId: process.env.USERPOOL_ID,
        Username: email,
        TemporaryPassword: password,
        MessageAction: 'SUPPRESS',
        UserAttributes: [
            { Name: 'name', Value: email },
            { Name: 'email', Value: email },
            { Name: 'email_verified', Value: 'True' }
        ]
    }
    await cognito.adminCreateUser(params).promise()
    return { email, password }
}
