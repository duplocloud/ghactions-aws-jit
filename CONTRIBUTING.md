# Contributing

## Set up development environment

You can either set up your dev environment locally or use a devcontainer which has all the dependencies installed

### devcontainer

Install [Docker](https://www.docker.com/products/docker-desktop/)
Install [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) vscode extension
Create a `devcontainer.env` file with the following environment variables:

```shell
duplo_token=XXXXX
duplo_host=https://XXXX.duplocloud.net
duplo_tenant_id=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
duplo_tenant_name=default
```

Run the `Dev Containers: Open Folder in Container...` command from the Command Palette (`F1`)

`npm install` and `npm tests` will run at startup.

References: [Developing inside a Container](https://code.visualstudio.com/docs/devcontainers/containers)

### local

If you prefer to develop locally you can download all the dependencies manaully: NodeJs, Typescript, Jest, etc

Then run:
```shell
npm install
```

Create the following environment variables: 

```shell
duplo_token=XXXXX
duplo_host=https://XXXX.duplocloud.net
duplo_tenant_id=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
duplo_tenant_name=default
```
## Running locally

In vscode, create a `.vscode/launch.json` file that looks like this:
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "program": "${workspaceFolder}/lib/main.js",
            "outFiles": [
                "${workspaceFolder}/**/*.js"
            ]
        }
    ]
}
```

You can make changes to the `typescript` then run hit `F5` to run/debug. This launchfile automatically compiles the `typescript` code into `javascript`, which node can run.

Alternatively, you can run one of the following commands in your terminal to compile:

```shell
tsc
# or
npm run build
```

And this command to run the action:

```shell
node lib/main.js
```

## Debugging



This should allow you to set breakpoints and step through your code in the debugger

## Running tests

Run tests locally by running either of these two commands on your terminal:
```shell
jest
```
or 
```shell
npm test
```
