const fs = require("fs");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const BASE_URL = "https://alternativeto.net/platform/all/";

const getListInfo = async (page) => {
	const items = await page.evaluate(() =>
		Array.from(document.querySelectorAll("li[data-testid]")).map((element) => {
			const key = Object.keys(element).find((key) =>
				key.startsWith("__reactInternalInstance")
			);
			const instance = element[key];
			return instance.return.pendingProps;
		})
	);
	return items;
};

// init
(async () => {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();
	const maxPage = 5;
	let items = [];

	for (let index = 1; index <= maxPage; index++) {
		let url = `${BASE_URL}?p=${index}`;
		await page.goto(url);
    await page.waitFor(2000);
    const newItems = await getListInfo(page);
		items = items.concat(newItems);
	}

	let data = JSON.stringify(items, null, 2);
	fs.writeFileSync("items.json", data);

	await browser.close();
})();

// const items = await page.evaluate(async () => {
//   const list = document.querySelectorAll("#mainContent .app-list-item");
//   return Array.from(list).map((item) => {
//     const tags = Array.from(item.querySelectorAll(".badges li")).filter(
//       (tag) => {
//         console.log(tag.classList.contains === "badge-license");
//         return tag;
//       }
//     );

//     return {
//       name: item.querySelector(".app-info .app-header h2 a").innerText,
//       link: item
//         .querySelector(".app-info .app-header h2 a")
//         .getAttribute("href"),
//       description: item.querySelector(".app-info .description p").innerText,
//       avatar: item.querySelector(".mobile-icon img").getAttribute("src"),
//       votes: item.querySelector(".like-button > span").innerText,
//       openSource: item
//         .querySelector(".badges .badge-license")
//         .innerText.toLowerCase()
//         .includes("open source"),
//       badge: item.querySelector(".badges .badge-license").innerText,
//       tags,
//     };
//   });
