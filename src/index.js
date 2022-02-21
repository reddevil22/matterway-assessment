const puppeteer = require('puppeteer');
const readline = require("readline-sync");

(async () => {
    // input from user
    const inputtedGenre = readline.question('Which is your preferred genre? ')
    console.log("🚀 ~ file: index.js ~ line 6 ~ inputtedGenre", inputtedGenre)

    // create puppeteer instance
    const browser = await puppeteer.launch();
    const goodReads = await browser.newPage();
    await goodReads.setViewport({ width: 2560, height: 1440 });

    // navigate to goodreads
    await goodReads.goto('https://www.goodreads.com/choiceawards/best-books-2020');

    // extract genres from elements
    const genres = await goodReads.$$eval('h4.category__copy', genres => { return genres.map(genre => genre.textContent.replace(/\n/g, '')) })
    console.log('Available genres', genres)

    // match inputted genre with extracted genres
    const selectedGenre = genres.find(scrappedGenres => scrappedGenres.toLocaleLowerCase().includes(inputtedGenre.toLocaleLowerCase()))
    console.log('Selected genre:', selectedGenre)


    const [button] = await goodReads.$x(`//h4[contains(., '${selectedGenre}')]`);
    if (button) {
        const parent = (await button.$x('..'))[0]
        // navigate to selected genre
        await parent.click();
    }
    else {
        console.log('Selected genre not available');
        await browser.close();
    }

    await goodReads.waitForNavigation();

    // extract book names from image alt tags
    const imgAlts = await goodReads.evaluate(() => {
        const alts = Array.from(
            document.querySelectorAll(".pollAnswer__bookLink > img")
        ).map((image) => image.getAttribute("alt"));
        return alts;
    });

    // generate random number for selecting random book from image alts
    const randomIndex = Number((Math.random() * imgAlts.length - 1).toFixed(0))
    await goodReads.screenshot({ path: 'random_genre.png' })

    // navigate to amazon
    console.log('Navigating to Amazon to search for', imgAlts[randomIndex])
    // use query parameter with randomly selected book name to search
    await goodReads.goto(`https://www.amazon.com/s?k=${imgAlts[randomIndex].replace(/ /g, '+')}`, { waitUntil: "networkidle0" })
    await goodReads.screenshot({ path: 'book_search.png' })
    console.log('screenshotted book search')

    console.log('Searching for hardcover')
    // try to find Hardcover selection
    const [hardcover] = await goodReads.$x(`//a[contains(., 'Hardcover')]`);
    if (hardcover) {
        await hardcover.click();
    }
    else {
        console.log('Hardcover not available, searching for paperback')
        // try to find Paperback selection
        const [paperback] = await goodReads.$x(`//a[contains(., 'Paperback')]`);
        if (paperback) {
            await paperback.click();
        }
        else {
            console.log('hardcover and paperback not available')
            await browser.close();
        }
    }
    await goodReads.waitForNavigation();

    // click on top result
    console.log('Clicked on top result')
    await goodReads.waitForTimeout(3000)
    await goodReads.screenshot({ path: 'book_result.png' })
    console.log('book result screenshotted')

    // try to find add to cart button
    let addToCartButtonExists = await goodReads.$('#add-to-cart-button');
    if (addToCartButtonExists) {
        await goodReads.click('#add-to-cart-button')
        console.log('Added to cart')
        await goodReads.waitForTimeout(3000)
        await goodReads.screenshot({ path: 'book_add_to_cart.png' })
        console.log('book add to cart screenshotted')

        // try to find checkout button
        let addToCartButtonExists = await goodReads.$('[name="proceedToRetailCheckout"]');
        if(addToCartButtonExists) {
            await goodReads.click('[name="proceedToRetailCheckout"]')
            console.log('Navigated to checkout')
            await goodReads.waitForTimeout(3000)
            await goodReads.screenshot({ path: 'book_checkout.png' })
            console.log('book checkout screenshotted')
    
            await browser.close();
        }
        else {
            console.log('Cannot find checkout button')
            await browser.close();
        }
    }
    else {
        // try to find alternative checkout button
        let addToCartButtonUBBExists = await goodReads.$('#add-to-cart-button-ubb');
        if (addToCartButtonUBBExists) {
            await goodReads.click('#add-to-cart-button-ubb')
            console.log('Added to cart')
            await goodReads.waitForTimeout(3000)
            await goodReads.screenshot({ path: 'book_add_to_cart.png' })
            console.log('book add to cart screenshotted')

            await goodReads.click('[name="proceedToRetailCheckout"]')
            console.log('Navigated to checkout')
            await goodReads.waitForTimeout(3000)
            await goodReads.screenshot({ path: 'book_checkout.png' })
            console.log('book checkout screenshotted')

            await browser.close();
        }
    }

})();

// 1645266459