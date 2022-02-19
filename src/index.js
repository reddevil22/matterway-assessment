const puppeteer = require('puppeteer');
const readline = require("readline-sync");

(async () => {
    const inputtedGenre = readline.question('Which is your preferred genre? ')

    const browser = await puppeteer.launch();
    const goodReads = await browser.newPage();
    await goodReads.setViewport({ width: 2560, height: 1440 });

    await goodReads.goto('https://www.goodreads.com/choiceawards/best-books-2020');

    const genres = await goodReads.$$eval('h4.category__copy', genres => { return genres.map(genre => genre.textContent.replace(/\n/g, '')) })
    console.log(genres)

    const selectedGenre = genres.find(scrappedGenres => scrappedGenres.toLocaleLowerCase().includes(inputtedGenre))
    console.log('Selected genre:', selectedGenre)

    const [button] = await goodReads.$x(`//h4[contains(., '${selectedGenre}')]`);
    if (button) {
        const parent = (await button.$x('..'))[0]
        await parent.click();
    }
    else console.log('no button')

    await goodReads.waitForNavigation();

    const imgAlts = await goodReads.evaluate(() => {
        const alts = Array.from(
            document.querySelectorAll(".pollAnswer__bookLink > img")
        ).map((image) => image.getAttribute("alt"));
        return alts;
    });
    console.log("🚀 ~ file: index.js ~ line 34 ~ imgAlts ~ imgAlts", imgAlts)

    const randomIndex = Number((Math.random() * imgAlts.length - 1).toFixed(0))
    console.log("🚀 ~ file: index.js ~ line 37 ~ randomIndex", randomIndex)
    await goodReads.screenshot({ path: 'random_genre.png' })
    console.log('random book selected', imgAlts[randomIndex])

    await goodReads.goto(`https://www.amazon.com/s?k=${imgAlts[randomIndex].replace(/ /g, '+')}`, { waitUntil: "networkidle0" })
    await goodReads.screenshot({ path: 'book_search.png' })
    console.log('screenshotted book search')

    // const [bookButton] = await goodReads.$x(`//span[contains(., 'Books')]`);
    // if (bookButton) {
    //     const parent = (await bookButton.$x('..'))[0]
    //     await parent.click();
    // }
    // else console.log('no button')
    // console.log('Clicked on Books filter')
    // // await goodReads.waitForNavigation();
    // await goodReads.waitForTimeout(3000)
    // await goodReads.screenshot({ path: 'book_filter.png' })
    // await goodReads.type('#twotabsearchtextbox', imgAlts[randomIndex])
    // await goodReads.click('#nav-search-submit-button')
    // await goodReads.waitForSelector('#resultsCol')
    // await goodReads.click('.aok-relative > img')

    const [hardcover] = await goodReads.$x(`//a[contains(., 'Hardcover')]`);
    if (hardcover) {
        await hardcover.click();
    }
    else {
        const [paperback] = await goodReads.$x(`//a[contains(., 'Paperback')]`);
        await paperback.click();
    }
    await goodReads.waitForNavigation();

    console.log('Clicked on top result')
    // await goodReads.waitForSelector('#add-to-cart-button')
    await goodReads.waitForTimeout(3000)
    // await goodReads.waitForSelector('#sc-buy-box-ptc-button')
    // await goodReads.click('[name]=proceedToRetailCheckout')
    await goodReads.screenshot({ path: 'book_result.png' })
    console.log('book result screenshotted')

    await goodReads.click('#add-to-cart-button')
    await goodReads.waitForTimeout(3000)
    await goodReads.screenshot({ path: 'book_add_to_cart.png' })
    console.log('book add to cart screenshotted')

    await goodReads.click('[name="proceedToCheckout"]')
    await goodReads.waitForTimeout(3000)
    await goodReads.screenshot({ path: 'book_checkout.png' })
    console.log('book checkout screenshotted')

    await browser.close();
})();

// 1645266459