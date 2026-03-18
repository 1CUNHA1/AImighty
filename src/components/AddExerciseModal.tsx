import { useState, useMemo } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import exerciseMapping from "@/data/exercise_mapping.json";
import exercisesByMuscle from "@/data/exercises_by_muscle.json";

type ExerciseSchema = {
  name: string;
  id?: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  primary_muscle?: string;
};

type AddExerciseModalProps = {
  onAdd: (exercise: ExerciseSchema) => void;
  planMuscleGroups?: string[];
};

// Create a list of all available exercises from the JSON mapping
const ALL_EXERCISES = Object.entries(exerciseMapping).map(([name, id]) => ({
  name: name.charAt(0).toUpperCase() + name.slice(1),
  id,
}));

export function AddExerciseModal({ onAdd, planMuscleGroups = [] }: AddExerciseModalProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterByPlan, setFilterByPlan] = useState(planMuscleGroups.length > 0);

  // Compute targeted exercises based on plan muscle groups
  const targetedExercises = useMemo(() => {
    if (planMuscleGroups.length === 0 || planMuscleGroups.includes("Full Body")) return ALL_EXERCISES;
    
    const targetedIds = new Set<string>();
    
    // Map our simplified plan muscle groups to the bodyParts/targets in the JSON if necessary
    // Fortunately, exercises_by_muscle seems to use broad categories like "Chest", "Back", "Legs", etc.
    // We'll do a case-insensitive check against the keys in exercisesByMuscle
    Object.entries(exercisesByMuscle).forEach(([groupName, groupExercises]) => {
      const isMatch = planMuscleGroups.some(pmg => 
        groupName.toLowerCase().includes(pmg.toLowerCase()) || 
        pmg.toLowerCase().includes(groupName.toLowerCase())
      );
      
      if (isMatch) {
        (groupExercises as any[]).forEach(ex => targetedIds.add(String(ex.id)));
      }
    });

    if (targetedIds.size === 0) return ALL_EXERCISES;

    return ALL_EXERCISES.filter(ex => targetedIds.has(ex.id));
  }, [planMuscleGroups]);

  const filteredExercises = useMemo(() => {
    const dataSource = filterByPlan ? targetedExercises : ALL_EXERCISES;
    if (!search) return dataSource.slice(0, 50); // Show max 50 initially
    
    const lowerSearch = search.toLowerCase();
    return dataSource.filter((ex) =>
      ex.name.toLowerCase().includes(lowerSearch)
    ).slice(0, 50);
  }, [search, filterByPlan, targetedExercises]);

  const handleAdd = (ex: { name: string; id: string }) => {
    // We make an educated guess for sets/reps, the user can edit later if they want
    onAdd({
      name: ex.name,
      id: ex.id,
      sets: 3,
      reps: "8-12",
      rest_seconds: 60,
    });
    setOpen(false);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-12 border-dashed border-2 border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Add Exercise
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-primary/20 max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b border-border/50">
          <DialogTitle className="font-['Space_Grotesk'] text-lg">Add Exercise</DialogTitle>
          {planMuscleGroups.length > 0 && planMuscleGroups[0] !== "Full Body" && (
            <div className="flex items-center space-x-2 mt-2 bg-primary/10 p-2 rounded-lg border border-primary/20">
              <Switch 
                id="filter-muscles" 
                checked={filterByPlan} 
                onCheckedChange={setFilterByPlan} 
                className="data-[state=checked]:bg-primary"
              />
              <Label htmlFor="filter-muscles" className="text-xs text-primary font-medium cursor-pointer">
                Only show {planMuscleGroups.join(" & ")} exercises
              </Label>
            </div>
          )}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search library..."
              className="pl-9 bg-secondary/50 border-border h-10"
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-2 scrollbar-none">
          {filteredExercises.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground text-sm">
              No exercises found matching "{search}"
            </div>
          ) : (
            <div className="space-y-1">
              {filteredExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleAdd(ex)}
                  className="w-full text-left px-3 py-3 rounded-lg hover:bg-primary/10 transition-colors flex items-center justify-between group"
                >
                  <span className="text-sm font-medium">{ex.name}</span>
                  <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
