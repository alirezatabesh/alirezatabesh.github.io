const articleList = document.getElementById("articles-list");
const articleViewer = document.getElementById("article-viewer");
const articleContent = document.getElementById("article-content");

async function loadArticles() {
    try {
        const response = await fetch("articles.json");

        if (!response.ok) {
            throw new Error(`Unable to load articles.json (${response.status})`);
        }

        const articles = await response.json();

        articleList.innerHTML = "";

        if (!articles.length) {
            articleList.innerHTML = `
                <div class="card">
                    <h3>No articles yet</h3>
                    <p>Add your first Markdown article to the <code>articles</code> folder.</p>
                </div>
            `;
            return;
        }

        for (const article of articles) {
            const card = document.createElement("div");
            card.className = "card article-card";

            card.innerHTML = `
                <div class="article-meta">${escapeHtml(article.date || "")}</div>
                <h3>${escapeHtml(article.title)}</h3>
                <p>${escapeHtml(article.description || "")}</p>
                <a class="article-link" href="articles.html?article=${encodeURIComponent(article.file)}">
                    Read article →
                </a>
            `;

            articleList.appendChild(card);
        }

        const params = new URLSearchParams(window.location.search);
        const articleFile = params.get("article");

        if (articleFile) {
            await openArticle(articleFile, articles);
        }

    } catch (error) {
        articleList.innerHTML = `
            <div class="card">
                <h3>Could not load articles</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>
        `;
    }
}

async function openArticle(file, articles) {
    const article = articles.find(x => x.file === file);

    if (!article) {
        throw new Error("Article not found.");
    }

    const response = await fetch(`articles/${article.file}`);

    if (!response.ok) {
        throw new Error(`Unable to load ${article.file}`);
    }

    const markdown = await response.text();

    articleContent.innerHTML = marked.parse(markdown);

    articleList.parentElement.hidden = true;
    articleViewer.hidden = false;

    document.title = `${article.title} | Alireza Tabesh`;

    window.scrollTo({
        top: 0,
        behavior: "instant"
    });
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}

loadArticles();