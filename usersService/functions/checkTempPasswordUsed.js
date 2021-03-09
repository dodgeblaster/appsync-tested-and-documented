const aws = require('aws-sdk')
const cognito = new aws.CognitoIdentityServiceProvider({
    region: process.env.AWS_REGION
})

module.exports.handler = async ({ email }) => {
    const params = {
        UserPoolId: process.env.USERPOOL_ID,
        Username: email
    }

    const x = await cognito.adminGetUser(params).promise()
    return x.UserStatus !== 'FORCE_CHANGE_PASSWORD'
}
