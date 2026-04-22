export function SiteFooter() {
	return (
		<footer className="shrink-0 border-t">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
				<p className="text-xs text-muted-foreground">
					SkillMap — Visualize &amp; manage your agent skills.
				</p>
				<p className="flex items-center gap-1 text-xs text-muted-foreground">
					Built by{' '}
					<a
						href="https://github.com/Humaminho"
						target="_blank"
						rel="noopener noreferrer"
						className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
					>
						Humaminho
					</a>
				</p>
			</div>
		</footer>
	);
}
