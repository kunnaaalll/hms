export function MainFooter() {
  return (
    <footer className="py-8 border-t bg-muted/50">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Lavender Luxury Hotel. All rights reserved.</p>
        <p>Powered by Lavender Stays</p>
      </div>
    </footer>
  );
}
