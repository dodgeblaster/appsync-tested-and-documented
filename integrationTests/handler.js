const AWS = require('aws-sdk')
const https = require('https')
const assert = require('assert')

/**
 * Get Api Endpoint
 *
 * In order to run this test both locally and in side a CI pipeline,
 * we need to get the url in a way that does not involve the
 * serverless.yml file. Accessing this value by making
 * a CloudFormation sdk call will work in both scenarios.
 *
 */
async function getStackOutputs(region, stackName) {
    const client = new AWS.CloudFormation({
        region
    })

    let response
    try {
        response = await client
            .describeStacks({
                StackName: stackName
            })
            .promise()
    } catch (e) {
        throw new Error(
            `Cannot find stack ${stackName}: ${e.message}\n` +
                `Please make sure stack with the name "${stackName}" exists.`
        )
    }

    const stacks = response.Stacks
    const stackOutputs = stacks[0].Outputs

    const apiOutput = stackOutputs.find(
        (output) => output.OutputKey === 'GraphQL'
    )

    const keyOutput = stackOutputs.find(
        (output) => output.OutputKey === 'APIKey'
    )

    return {
        url: apiOutput.OutputValue,
        key: keyOutput.OutputValue
    }
}

exports.handler = async (event, context) => {
    /**
     * Setup
     */
    const codepipeline = new AWS.CodePipeline()
    const jobId = event['CodePipeline.job'].id
    const putJobSuccess = async (message) => {
        const params = {
            jobId: jobId
        }
        await codepipeline.putJobSuccessResult(params).promise()
        return message
    }

    const putJobFailure = async (message) => {
        const params = {
            jobId: jobId,
            failureDetails: {
                message: JSON.stringify(message),
                type: 'JobFailed',
                externalExecutionId: context.awsRequestId
            }
        }
        await codepipeline.putJobFailureResult(params)
        return message
    }

    /**
     * Test
     */
    try {
        const values = await getStackOutputs('us-east-1', 'AppsyncTested')
        const post = (data) => {
            return new Promise((res1, rej) => {
                try {
                    const options = {
                        hostname: values.url.substr(8, values.url.length - 16),
                        port: 443,
                        path: '/graphql',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': values.key
                        }
                    }
                    let body = ''
                    const post_req = https.request(options, (res) => {
                        res.setEncoding('utf8')
                        res.on('data', (chunk) => (body = body + chunk))
                        res.on('end', () => res1(body))
                    })
                    post_req.write(JSON.stringify(data))
                    post_req.end()
                } catch (e) {
                    rej(e)
                }
            })
        }

        /**
         * Create a Note
         */
        const createdRes = await post({
            query: `
                mutation MyMutation {
                  create(content: "one", title: "two") {
                    id
                  }
                }
            `
        })
        const id = JSON.parse(createdRes).data.create.id

        /**
         * Get a Note
         */
        const result = await post({
            query: `
                query MyQuery {
                  note(id: "${id}") {
                    id
                    content
                  }
                }
            `
        })
        const retrievedContent = JSON.parse(result).data.note.content
        assert(retrievedContent === 'one')

        /**
         * Remove a Note
         */
        const removedRes = await post({
            query: `
                mutation MyMutation {
                  remove(id: "${id}") {
                    id
                  }
                }
            `
        })
        const removedId = JSON.parse(removedRes).data.remove.id
        assert(removedId === id)

        /**
         * Return Success
         */
        return await putJobSuccess('Tests passed.')
    } catch (e) {
        return await putJobFailure(e)
    }
}
