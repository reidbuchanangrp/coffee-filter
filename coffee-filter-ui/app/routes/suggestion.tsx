import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Coffee, MessageCircle } from "lucide-react";
import { ContactFormDialog } from "~/components/ContactFormDialog";
import { Button } from "~/components/ui/button";

const Suggestion = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-3 border-b bg-primary">
        <div className="flex items-center gap-2">
          <Coffee className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold font-serif">CoffeeFilter</h1>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Map
          </Link>
        </Button>
      </header>
      <main className="container max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="flex items-center gap-3 justify-center">
            <div className="bg-primary/10 p-2 rounded-lg">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold font-serif">
              Know a great coffee shop?
            </h2>
          </div>
          <p className="text-muted-foreground">
            We're always looking to add more amazing coffee shops to our map. If
            you know of a specialty coffee shop that should be featured, or just
            want to say hey, let us know!
          </p>
          <div className="flex justify-center">
            <Button
              variant="ghost"
              className=" text-primary bg-primary/10 font-semibold"
              onClick={() => setIsContactOpen(true)}
            >
              Suggest a Coffee Shop
            </Button>
          </div>
          <ContactFormDialog
            open={isContactOpen}
            onOpenChange={setIsContactOpen}
          />
        </div>
      </main>
    </div>
  );
};

export default Suggestion;
