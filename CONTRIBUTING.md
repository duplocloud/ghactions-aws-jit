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

## Running tests

Run tests locally by running either of these two commands on your terminal:
```shell
jest
```
or 
```shell
npm test
```

## Pushing changes

To push changes to the repository, create a branch and push your changes to that branch. Then create a pull request to merge your branch into `develop`.

### Building and packaging

Build and package the code before opening a pull request. This will ensure that the code is packaged correctly and your changes are reflected in the action.


```shell
# Install dependencies
npm ci
# Rebuild the dist/ directory
npm run build
npm run package
```

Note: If you encounter permission issues while running the above commands, try running them with `sudo` or modify permissions to the `dist` directory.

```shell
sudo chmod -R a+w dist/
```

## Publishing

To publish the action to the marketplace, 
1. Run the `Start Release` workflow from the Actions tab in github. This will create a new release and publish the action `(release/x.x.x)` to the marketplace.
2. You can then test the action by creating a new workflow that uses the action. Reference the release branch in the workflow file. Example: `uses: duplocloud/ghactions-aws-jit@release/0.3.3`
3. Once you are satisfied with the changes, you can merge the release branch into `master`. This will publish the action to the marketplace. Example: `uses: duplocloud/ghactions-aws-jit@master`

### Versioning

The version of the action is defined in the `package.json` file. The version is automatically incremented when the `Start Release` workflow is run. The version is incremented based on the type of change that is being released. For example, if the last release was `v1.0.0` and the next release is a bug fix, the version will be `v1.0.1`. 

If the next release is a feature, you'll need to provide a new version by bumping the minor version. Example: `v1.2.0`.
If the next release is a breaking change, you'll need to bump the major version. Example: `v2.0.0`.

