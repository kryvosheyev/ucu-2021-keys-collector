import json
import asyncio
import httpx

import scrapy
import rx
from rx import operators as ops

from rx.scheduler.eventloop import AsyncIOScheduler
# scrapy crawl github_api -a q="aws" -a key="dsfrefregf"

class GithubApiSpider:
    name = "github_api"
    handle_httpstatus_list = [400, 403, 404]

    def __init__(self, key, q):
        self.key = key
        self.q = q
        self.start_requests()

    def start_requests(self):
        print("started")
        rx.interval(5).pipe(
            ops.flat_map(self.scrap_data),
            ops.map(self.organize_data),
            ops.flat_map(self.send_data),
        ).subscribe(scheduler=AsyncIOScheduler(loop))

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

    async def make_request(self, observer): 
        url = f"https://api.github.com/search/code?q={self.q}"
        headers = {"Authorization": f"Token {self.key}"}
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=headers)
                if (response.state !== 200)1
                resp = response.json()
                items = resp["items"]
                for rawData in items:
                    observer.on_next(rawData)

                observer.on_complete()
            except Exception as e:
                observer.on_error(e)

    def scrap_data(self, tick): 
        return rx.defer(lambda: rx.create(lambda o, s: loop.create_task(self.make_request(o))))
                # .pipe(
                #     ops.timeout(10),
                #     ops.retry(),
                # )
                # TODO добавить таймауты, ретраи, добавить случайный ключ

    def send_data(self, data): 
        return rx.create(
            lambda observer, scheduler: loop.create_task(self.http_send_data(data, observer))
        )

    async def http_send_data(self, data, observer): 
        async with httpx.AsyncClient() as client:
            response = await client.post("http://3.142.70.26:4001/parser/download-and-parse-file", data=json.dumps(data), headers={"Content-Type": "application/json"})
            print(response)
            observer.on_complete()



async def main(loop):
    GithubApiSpider("github key", "awsaccess")



loop = asyncio.get_event_loop()
loop.create_task(main(loop))
loop.run_forever()