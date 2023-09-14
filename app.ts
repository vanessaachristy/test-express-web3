import web3 from "web3";
import express, { Request, Response } from "express";
import Task from './Task.json';
  
const app = express();
app.use(express.urlencoded());
app.use(express.json());

const web3js = new web3(
  new web3.providers.WebsocketProvider("ws://127.0.0.1:7545")
);

const contractAbi = Task.abi;
const contractAddress = Task.networks[5777].address;
const contract = new web3js.eth.Contract(contractAbi, contractAddress) as any;


app.listen(3000, () => console.log("Successfully listening on port 3000!"));

/**
 * Get accounts
 */
app.get("/accounts", async function (req: Request, res: Response) {
  res.json({
    data: {
      accounts: await web3js.eth.getAccounts(),
    },
  });
});

/**
 * Get all tasks
 */
app.get("/tasks", async function (req: Request, res: Response) {
    const taskCount = await contract.methods.taskCount().call();
    let tasks = [];
    for (let i=1; i<=taskCount; i++) {
        let task = await contract.methods.tasks(i).call();
        let taskObj = {
            id: task.id.toString(),
            name: task.content.toString(),
            completed: task.completed
        };
        tasks.push(taskObj);
    }

    res.json({
        data: tasks
    })
});

/**
 * Get task by ID
 */
app.get("/tasks/:id", async function (req: Request, res: Response) {
    const taskId: string = req.params["id"];
    let tasks = [];
    let task = await contract.methods.tasks(taskId).call();
    let taskObj = {
            id: task.id.toString(),
            name: task.content.toString(),
            completed: task.completed
        };
    res.json({
        data: taskObj
    })
});

/**
 * Create new task
 */
app.post("/createTask", async function (req: Request, res: Response) {
    const account = req.body.account;
    const content = req.body.content;

    await contract.methods.createTask(content).send({from: account,}).then((taskResponse) => {
        console.log(taskResponse);
        res.status(200).send({
            message: "success",
            data: {
                address: taskResponse.logs[0].address,

            }
        })
    }).catch((err) => {
        console.trace(err);
        res.status(400).json({
            message: "error",
            error: err.toString()
        })
    })

});

/**
 * Toggle task
 */
app.put("/toggle", async function (req: Request, res: Response) {
    const taskId = req.body.taskId;
    const account = req.body.account;

    
    await contract.methods.toggleCompleted(taskId).send({from: account}).then((toggleRes) => {
        console.log(toggleRes);
        res.status(200).send({
            message: "success",
            data: {
                address: toggleRes.logs[0].address,
            }
        })
    }).catch(err => {
        console.trace(err);
        res.status(400).json({
            message: "error",
            error: err.toString()
        })
    })
})

