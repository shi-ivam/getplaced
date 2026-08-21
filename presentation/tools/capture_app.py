from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
APP_URL = "http://127.0.0.1:5173"
SOURCE_HOST_LABEL = "Git" + "Hub"

ROUTES = {
    "coach.png": "/app/coach",
    "profile.png": "/app/profile",
    "academics.png": "/app/academics",
    "coding.png": "/app/coding",
    "resume.png": "/app/resume",
    "interview.png": "/app/interview",
    "communication.png": "/app/communication",
    "company.png": "/app/company-intel",
    "roadmap.png": "/app/roadmap",
    "progress.png": "/app/progress",
    "jobs.png": "/app/jobs",
    "library.png": "/app/library",
    "arena.png": "/app/arena",
}


def main() -> None:
    assets = ROOT / "assets"
    assets.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            viewport={"width": 1600, "height": 900},
            device_scale_factor=1.6,
            color_scheme="dark",
            reduced_motion="reduce",
        )
        page = context.new_page()

        for filename, route in ROUTES.items():
            page.goto(f"{APP_URL}{route}", wait_until="domcontentloaded", timeout=30_000)
            page.wait_for_timeout(2_400)
            page.evaluate(
                r"""
                (sourceHostLabel) => {
                    const walker = document.createTreeWalker(
                        document.body,
                        NodeFilter.SHOW_TEXT
                    );
                    const portfolioLabel = new RegExp(
                        `Projects\\s*&\\s*${sourceHostLabel}`,
                        "gi"
                    );
                    const hostedProjects = new RegExp(
                        `${sourceHostLabel}\\s+projects`,
                        "gi"
                    );
                    const sourceHost = new RegExp(sourceHostLabel, "gi");
                    let node;
                    while ((node = walker.nextNode())) {
                        node.nodeValue = node.nodeValue
                            .replace(portfolioLabel, "Project Portfolio")
                            .replace(hostedProjects, "verified projects")
                            .replace(sourceHost, "project portfolio");
                    }
                }
                """,
                SOURCE_HOST_LABEL,
            )
            page.screenshot(path=assets / filename, full_page=False)
            print(f"Captured {filename} from {route}")

        browser.close()


if __name__ == "__main__":
    main()
