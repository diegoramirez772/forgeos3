import axios from "axios"

const API_URL = process.env.VITE_API_URL

export async function startRun(agent: string) {

    try {

        const response = await axios.post(`${API_URL}/runs/start`, {
            agent
        })

        console.log("Run started:", response.data)

        return response.data

    } catch (error) {

        console.log("API not available, using mock run")

        return {
            id: "mock-run-" + Date.now()
        }

    }

}

export async function finishRun(runId: string, result: any) {

    try {

        const response = await axios.post(`${API_URL}/runs/finish`, {
            runId,
            result
        })

        console.log("Run finished:", response.data)

        return response.data

    } catch (error) {

        console.log("Mock finish run:", runId)

    }

}

export async function beforeToolCall(tool: string, payload: any) {

    try {

        const response = await axios.post(`${API_URL}/tools/evaluate`, {
            tool,
            payload
        })

        if (!response.data.allowed) {

            console.log("Tool blocked:", tool)
            return false

        }

        return true

    } catch (error) {

        console.log("Skipping API tool check (mock mode)")
        return true

    }

}