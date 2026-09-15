export type StarPetState = "idle" | "searching" | "ready" | "moving" | "arrived" | "completed";

const stateLabels: Record<StarPetState, string> = {
  idle: "星粒正在等待你的路线灵感",
  searching: "星粒正在寻找路线",
  ready: "星粒已经找到路线",
  moving: "星粒正在陪你前进",
  arrived: "星粒正在庆祝到站",
  completed: "星粒正在庆祝路线完成",
};

export function StarPet({ state = "idle", size = "hero" }: { state?: StarPetState; size?: "hero" | "compact" }) {
  return (
    <div className={`star-pet star-pet--${state} star-pet--${size}`} role="img" aria-label={stateLabels[state]}>
      <img src="/assets/star-pet-xingli.png?v=2" alt="" />
    </div>
  );
}
