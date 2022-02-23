<p align="center">
  <a href="https://github.com/duplocloud/ghactions-aws-jit/actions"><img alt="ghactions-aws-jit status" src="https://github.com/duplocloud/ghactions-aws-jit/workflows/build-test/badge.svg"></a>
</p>

# Github action to get just-in-time access to AWS 

This action will retrieve just-in-time AWS credentials from Duplo

# Usage

Here is an example of what to put in your `.github/workflows/build-and-deploy.yml` file to use this workflow.

```yaml
name: Build and Deploy
on:
  push:
    branches:
      - develop # branch to trigger on
jobs:
  deploy:
    # This example get AWS credentials, then lists all S3 buckets.
    name: Deploy with DuploCloud
    runs-on: ubuntu-latest
    steps:
      - name: aws-jit
        uses: duplocloud/ghactions-aws-jit@master
        with:
          duplo_host: https://mysystem.duplocloud.net
          duplo_token: ${{ secrets.DUPLO_TOKEN }}
          tenant: default
      - name: list-s3
        run: aws s3 ls
```
