# UCU-2021-Keys-Collector Crawler

### Add your github key to Dockerfile

### Build your image
`docker build --tag github-docker .`

### Run your image as a container
`docker run --env "GITHUB_KEY"="your github key" --env "Q_STRING"="the string you are looking for" github-docker`
