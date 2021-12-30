import json

import scrapy


class GithubApiSpider(scrapy.Spider):
    name = "github_api"
    handle_httpstatus_list = [404]

    def start_requests(self):
        url = f"https://api.github.com/search/code?q={self.q}"
        headers = {"Authorization": f"Token {self.key}"}
        yield scrapy.Request(url, headers=headers, callback=self.get_data)

    def get_data(self, response):
        resp = response.json()
        items = resp.get("items")
        self.logger.debug(f"len of items is {len(items)}")
        for item in items:
            project = item.get("repository").get("html_url")
            fileUrl = item.get("html_url")
            sha = item.get("sha")
            language = item.get("name").split(".")[-1]
            data = {
                "project": project,
                "fileUrl": fileUrl,
                "sha": sha,
                "language": language,
            }
            url = f"https://storage.scrapinghub.com/collections/{self.dash}/s/secret_key_projects/{sha}?apikey={self.dash_key}"
            yield scrapy.Request(
                url=url,
                method="GET",
                dont_filter=True,
                meta=data,
                callback=self.in_db_check,
            )

    def in_db_check(self, response):
        sha = response.meta.get("sha")
        if sha not in response.text:
            url = f"https://storage.scrapinghub.com/collections/{self.dash}/s/secret_key_projects?apikey={self.dash_key}"
            yield scrapy.Request(
                url=url,
                method="POST",
                body=json.dumps(
                    {
                        "_key": sha,
                        "value": {
                            "project": response.meta.get("project"),
                            "fileUrl": response.meta.get("fileUrl"),
                            "sha": response.meta.get("sha"),
                            "language": response.meta.get("language"),
                        },
                    }
                ),
                dont_filter=True,
                meta=response.meta,
                callback=self.yield_data,
            )

    def yield_data(self, response):
        if response.status == 200:
            yield {
                "_key": response.meta.get("sha"),
                "value": {
                    "project": response.meta.get("project"),
                    "fileUrl": response.meta.get("fileUrl"),
                    "sha": response.meta.get("sha"),
                    "language": response.meta.get("language"),
                },
            }
        else:
            raise Exception(f"{response.url} is {response.status}")
