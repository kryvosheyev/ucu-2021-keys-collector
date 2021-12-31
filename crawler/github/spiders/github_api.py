import json

import scrapy


class GithubApiSpider(scrapy.Spider):
    name = "github_api"
    handle_httpstatus_list = [400, 403, 404]

    def start_requests(self):
        url = f"https://api.github.com/search/code?q={self.q}"
        headers = {"Authorization": f"Token {self.key}"}
        yield scrapy.Request(url, headers=headers, callback=self.get_data)

    @staticmethod
    def organize_data(item):
        project = item.get("repository").get("html_url")
        fileUrl = item.get("html_url")
        sha = item.get("sha")
        language = item.get("name").split(".")[-1]
        data = {
            "project": project,
            "fileUrl": fileUrl,
            "fileHash": sha,
            "language": language,
        }
        return data

    def get_data(self, response):
        resp = response.json()
        items = resp.get("items")
        self.logger.debug(f"len of items is {len(items)}")
        ready_data = map(self.organize_data, items)
        for data in ready_data:
            url = "http://3.142.70.26:4001/parser/download-and-parse-file"
            yield scrapy.Request(
                url=url,
                method="POST",
                dont_filter=True,
                meta=data,
                body=json.dumps(data),
                callback=self.yield_data,
            )

    def yield_data(self, response):
        yield {
            "project": response.meta.get("project"),
            "fileUrl": response.meta.get("fileUrl"),
            "fileHash": response.meta.get("sha"),
            "language": response.meta.get("language"),
        }
        if response.status != 200:
            raise Exception(f"{response.url} is {response.status}")
