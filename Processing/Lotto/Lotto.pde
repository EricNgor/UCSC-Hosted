// Eric Ngor 2017
// Edited for HTML embedding by referencing: https://cs.nyu.edu/~kapp/cs101/processing_on_the_web/
// Note: "Powerball" also refers to the Mega Ball from Mega Millions

// import processing.core.PApplet;
// import processing.event.MouseEvent;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;

private List<Integer> tierList;
private final int JACKPOT = 40000000;
private final int MENU = 0, POWERBALL = 1, MEGAMIL = 2, VIEWSTATS = 3; // mode values
private int modeMem; // store mode when going into stats
private final int RETURN = 1;
private final int COMMENCE = 1, ARROWTOP = 2, REROLL = 3, ON = 4, OFF = 5, STATS = 6, SPEED = 7; // modeHover values in POWERBALL or MEGAMIL
private int modeHover;
private int mode;

private String[] winningNums; private String winningPow;
private int multiplier;
private boolean multiplying;
private String yourPow;
private List<String[]> numsList;
private List<String> powList;
private List<Integer> gainList;
private int money;
private int spent;
private int winnings;
private final int LISTLIMIT = 90;
private int cost;
private boolean commencing;
private int scrollShift = 0;

private int speed;
private String speedS;
private boolean speedFocus;

// Statistics variables
private int ticketCount;
private int noWinCount;
private List<Integer> tierCountList;
private int tier1Count, tier2Count, tier3Count, tier4Count, tier5Count;
private int jackpotCount;

// public static void main(String[] args) {
//     PApplet.main(new String[] {"Lotto"});
// }

// public void settings() {
public void setup() {
    size(1000, 1000);
    numsList = new ArrayList<String[]>();
    powList = new ArrayList<String>();
    gainList = new ArrayList<Integer>();
    tierList = new ArrayList<Integer>();
    tierCountList = new ArrayList<Integer>();
}

public void start() {
    cost = 2;
    speed = 1;
    speedS = "1";
    if (mode == POWERBALL) {
        tierList.add(0);
        tierList.add(4); // tier1
        tierList.add(7);
        tierList.add(100);
        tierList.add(50000); // tier4
        tierList.add(1000000);
        for (int i = 0; i <= 5; i++) {
            tierCountList.add(0);
        }
    }
    else if (mode == MEGAMIL) {
        tierList.add(0);
        tierList.add(2); // tier1
        tierList.add(4);
        tierList.add(10);
        tierList.add(200); // tier4
        tierList.add(500);
        tierList.add(10000);
        tierList.add(1000000); // tier7
        for (int i = 0; i <= 7; i++) {
            tierCountList.add(0);
        }
    }
}

public void draw() {
    background(0);
    modeHover = 0;
    hoverTest();
    if (mode == MENU) menu();
    if (mode == POWERBALL || mode == MEGAMIL) { // powerball mode
        dispYourNums();
        for (int i = 0; i < gainList.size(); i++) {
            if (gainList.get(i) > 0) {
                dispGains(i);
            }
        }
        dispDivider();
        dispWinningNums();
        dispReroll();
        dispMultiplier();
        dispSpeedAdjust();
        cost = (!multiplying ? 2 : 3); // 2 standard, 3 if multiplying
        dispCost();
        dispSpent();
        dispWinnings();
        dispNet();
        if (scrollShift > 0) dispScrollArrow();
        dispCommence();
        dispStatsButton();
    }
    else if (mode == VIEWSTATS) {
        dispReturn();
        dispStats();
    }
    if (commencing) {
        for (int i = 0; i < speed; i++) {
            run();
        }
    }
    if (modeHover == SPEED) cursor(POINT); // input bar
    else if (modeHover != 0) cursor(HAND); // selections
    else cursor(ARROW);
    debug();
}  

public void menu() {
    if (mouseX > 418 && mouseX < 580 & mouseY > 485 && mouseY < 522) {
        modeHover = POWERBALL; // powerball
        cursor(HAND);
    }
    else if (mouseX > 388 && mouseX < 610 && mouseY > 582 && mouseY < 623) {
        modeHover = MEGAMIL; // Mega Millions
        cursor(HAND);
    }
    else {
        modeHover = 0;
        cursor(ARROW);
    }

    textAlign(CENTER, CENTER);
    fill(255);
    textSize(64);
    text("Lottery Simulation", width/2, height/2-150);
    textSize(32);
    if (modeHover == 1) fill(125); //gray highlighting
    else fill(255);
    text("Powerball", width/2, height/2);
    if (modeHover == 2) fill(125); 
    else fill(255);
    text("Mega Millions", width/2, height/2+100);
    
    textAlign(RIGHT, BOTTOM);
    fill(255);
    textSize(32);
    text("Eric Ngor", width-16, height-16);
}

public void run() {
    rollYourNums();
    spent += cost; 
    gainList.add(0, 0);
    int gain = testWinnings();

    if (multiplying) {
        if (mode == POWERBALL && gain == 1000000) gain = 2000000; // (https://www.lottery.net/powerball/power-play)
        else gain *= multiplier;
    }
    gainList.set(0, gain);
    winnings += gainList.get(0);

    ticketCount++;
    while (numsList.size() >= LISTLIMIT) { // memory overflow and lag prevention
        numsList.remove(LISTLIMIT-1);
        powList.remove(LISTLIMIT-1);
        gainList.remove(LISTLIMIT-1);
    }
}

public void rollYourNums() {
    int[] nums = new int[5];
    int lim = 0;
    if (mode == POWERBALL || modeMem == POWERBALL) lim = 69;
    else if (mode == MEGAMIL || modeMem == MEGAMIL) lim = 70;
    for (int i = 0; i < nums.length; i++) { // create int array of rolls
        nums[i] = (int)(Math.random()*lim)+1;
        for (int j = 0; j < i; j++) { //prevent copies
            if (nums[i] == nums[j]) {   
                i--;
                break;
            }
        }
    }
    sortInts(nums);

    numsList.add(0, new String[5]);
    for (int i = 0; i < nums.length; i++) { // add 0 in front if less than 10 and convert to String array
        numsList.get(0)[i] = (nums[i] < 10 ? "0" : "") + nums[i]; // Setting values of 0th String array
    }

    if (mode == POWERBALL || modeMem == POWERBALL) lim = 26;
    else if (mode == MEGAMIL || modeMem == MEGAMIL) lim = 25;
    int powNum = (int)(Math.random()*lim)+1; // roll
    powList.add(0, (powNum < 10 ? "0" : "") + powNum);
}

public void dispYourNums() {
    textAlign(LEFT, CENTER);
    textSize(32);
    fill(255);
    text("YOUR NUMBERS", 16, 16);

    textSize(28);
    fill(255);

    int x = 16;
    for (int i = 0; i < numsList.size(); i++) {
        x = 16;
        for (int j = 0; j < numsList.get(i).length; j++) {
            if (i*32 - (scrollShift*32) >= 0) {
                text(numsList.get(i)[j], x, i*32 - (scrollShift*32) + 64);
            }
            x += 64;
        }

    }

    // Powerball
    if (mode == POWERBALL) fill(255, 0, 0); 
    else if (mode == MEGAMIL) fill(255, 255, 0);
    for (int i = 0; i < powList.size(); i++) {
        if (i*32 - (scrollShift*32) >= 0) {
            text(powList.get(i), x, i*32 - (scrollShift*32) + 64);

        }
    }

}

public void dispGains(int index) {
    textAlign(LEFT, CENTER);
    textSize(32);
    fill(0, 255, 0);
    if (index*32 - (scrollShift*32) >= 0) {
        text("+$" + gainList.get(index), 16+(6*64), index*32 - (scrollShift*32) + 64);
    }
}

public int testWinnings() {
    int matches = 0;
    boolean spec = false;
    for (String yourNum : numsList.get(0)) {
        for (String winningNum : winningNums) {
            if (yourNum.equals(winningNum)) {
                matches++;
            }
        }
    }
    if (powList.get(0).equals(winningPow)) spec = true;

    if (mode == POWERBALL || modeMem == POWERBALL) {
        if ((matches == 0 && spec) || (matches == 1 && spec)) {
            tierCountList.set(1, tierCountList.get(1)+1); // increment counter
            return tierList.get(1);
        }
        else if ((matches == 2 && spec) || (matches == 3 && !spec)) {
            tierCountList.set(2, tierCountList.get(2)+1);
            return tierList.get(2);
        }
        else if ((matches == 3 && spec) || (matches == 4 && !spec)) {
            tierCountList.set(3, tierCountList.get(3)+1);
            return tierList.get(3);
        }
        else if (matches == 4 && spec) {
            tierCountList.set(4, tierCountList.get(4)+1);
            return tierList.get(4);
        }
        else if (matches == 5 && !spec) {
            tierCountList.set(5, tierCountList.get(5)+1);
            multiplier = 2;
            return tierList.get(5);
        }
        else if (matches == 5 && spec) {
            mouseX = width/2;
            mouseY = height/2;
            commencing = false;
            jackpotCount++;
            return JACKPOT;
        }
        else noWinCount++; return 0;
    }
    else if (mode == MEGAMIL) {
        if (matches == 0 && spec) {
            tierCountList.set(1, tierCountList.get(1)+1);
            return tierList.get(1);
        }
        else if (matches == 1 && spec) {
            tierCountList.set(2, tierCountList.get(2)+1);
            return tierList.get(2);
        }
        else if ((matches == 2 && spec) || (matches == 3 && !spec)) {
            tierCountList.set(3, tierCountList.get(3)+1);
            return tierList.get(3);
        }
        else if (matches == 3 && spec) {
            tierCountList.set(4, tierCountList.get(4)+1);
            return tierList.get(4);
        }
        else if (matches == 4 && !spec) {
            tierCountList.set(5, tierCountList.get(5)+1);
            return tierList.get(5);
        }
        else if (matches == 4 && spec) {
            tierCountList.set(6, tierCountList.get(6)+1);
            return tierList.get(6);
        }
        else if (matches == 5 && !spec) {
            tierCountList.set(7, tierCountList.get(7)+1);
            return tierList.get(7);
        }
        else noWinCount++; return 0;
    }
    return 0;
}

public void dispScrollArrow() {
    fill(255);
    textSize(40);
    textAlign(CENTER, CENTER);

    if (modeHover == ARROWTOP) fill(125);
    else fill(255);
    text("↑", width/2+50, 16);
}

public void dispDivider() {
    strokeWeight(3);
    stroke(255);
    line(4*width/7, 0, 4*width/7, height);
}

public void rollWinning() {
    winningNums = new String[5];
    int[] nums = new int[5];
    int lim = 0;
    if (mode == POWERBALL) lim = 69;
    else if (mode == MEGAMIL) lim = 70;
    for (int i = 0; i < nums.length; i++) { // create int array of rolls
        nums[i] = (int)(Math.random()*lim)+1;
        for (int j = 0; j < i; j++) { //prevent copies
            if (nums[i] == nums[j]) {
                i--;
                break;
            }
        }
    }
    sortInts(nums);
    for (int i = 0; i < nums.length; i++) { // add 0 in front if less than 10 and convert to String
        winningNums[i] = (nums[i] < 10 ? "0" : "") + nums[i];
    }

    if (mode == POWERBALL) lim = 26;
    else if (mode == MEGAMIL) lim = 25;

    int powNum = (int)(Math.random()*lim)+1;
    winningPow = (powNum < 10 ? "0" : "") + powNum;

    if (mode == POWERBALL) multiplier = rollPowerPlay();
    else if (mode == MEGAMIL) multiplier = rollMegaplier();
}

public void dispWinningNums() {
    textAlign(RIGHT, CENTER);
    textSize(32);
    fill(255);
    text("WINNING NUMBERS", width - 16, 16);

    int y = 64;
    int x = width - 16;
    textSize(28);

    if (mode == POWERBALL) fill(255, 0, 0); 
    else if (mode == MEGAMIL) fill(255, 255, 0);
    
    text(winningPow, x, y); // powerball
    x -= 64;
    fill(255);
    for (int i = winningNums.length-1; i >= 0; i--) {
        text(winningNums[i], x, y);
        x -= 64;
    }
}

public void dispReroll() {
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);

    if (modeHover == REROLL) fill(125);
    else fill(255);
    text("REROLL", 11*width/14, height/7);
}

public void reroll() {
    rollWinning();
    numsList = new ArrayList<String[]>();
    powList = new ArrayList<String>();
    gainList = new ArrayList<Integer>();
    run();
    scrollShift = 0;
}

public void dispMultiplier() {
    textAlign(LEFT, CENTER);
    textSize(32);
    fill(255);
    String name = "";
    if (mode == POWERBALL) name = "Power Play: ";
    else if (mode == MEGAMIL) name = "Megaplier: ";

    if (mode == POWERBALL || mode == MEGAMIL) {
        text(name + multiplier + "x", 4*width/7+16, 3*height/14);
    }
    strokeWeight(4);
    stroke(255);
    if (modeHover == ON) fill(125); // gray highlight
    else fill(255);
    if (multiplying) line(4*width/7+16, 3*height/14+52, 4*width/7+64, 3*height/14+52); // underline
    text("ON", 4*width/7+16, 3*height/14+32);

    if (modeHover == OFF) fill(125);
    else fill(255);
    if (!multiplying) line(666, 3*height/14+52, 726, 3*height/14+52);
    text("OFF", 4*width/7+96, 3*height/14+32);
}

public int rollPowerPlay() { 
    //(page no longer exists)
    //https://www.forbes.com/sites/startswithabang/2016/01/13/the-science-of-p0werball/#4a4343ed5d8b
    int randomizer = (int)(Math.random()*43)+1;
    if (randomizer >= 19) return 2;      // 24/43
    else if (randomizer >= 6) return 3;  // 13/43
    else if (randomizer >= 3) return 4;  //  3/43
    else if (randomizer <= 2) return 5;  //  2/43
    else if (randomizer == 1) return 10; //  1/43
    return 1;
}

public int rollMegaplier() {
    int randomizer = (int)(Math.random()*15)+1;
    if (randomizer >= 11) return 2;     // 5/15
    else if (randomizer >= 5) return 3; // 6/15
    else if (randomizer >= 2) return 4; // 3/15
    else if (randomizer == 1) return 5; // 1/15
    return 1;
}

public void dispSpeedAdjust() {
    textAlign(LEFT, CENTER);
    textSize(32);
    fill(255);
    text("Speed", 4*width/7+16, 3*height/14+116);

    strokeWeight(3); stroke(255);
    fill(0, 0);
    rect(4*width/7+16, 3*height/14+148, 96, 36);

    textSize(30);
    fill(255);
    textAlign(LEFT, TOP);
    text(speedS, 4*width/7+20, 3*height/14+149); 

    if (speedFocus) {
        if (second()%2==0) {
            strokeWeight(2);
            stroke(255);
            int x = (4*width/7+23) +(int)textWidth(speedS);
            line(x, 3*height/14+154, x, 3*height/14+178);
        }
    }
    else speedS = "" + speed;
}

public void keyPressed() {
    if (speedFocus) {
        if (key == DELETE) {
            speedS = speedS.substring(0, speedS.length()-1);
        }
        else if (key == ENTER || key == RETURN) {
            //Regex: https://stackoverflow.com/questions/7607260/check-non-numeric-characters-in-string
            if (!speedS.equals("0") && speedS.matches("^[0-9]+$")) { // good entry
                speed = strToInt(speedS);
                speedFocus = false;
            }
            else if (speedS == "" || speedS == "0" || !speedS.matches("^[0-9]+$")) { //prevent blank result
                speedS = ""+speed;
            }
        }
        else if (speedS.length() < 4) {
            if (key >= '0' && key <= '9') {
                speedS += key - '0';
            } 
        }
    } else {
        if (key == 119) scroll(-1); // UP (w)
        else if (key == 115) scroll(1); // DOWN (s)
    }
}

public void dispCost() {
    textAlign(RIGHT, CENTER);
    textSize(18);
    fill(255);
    text("Cost per ticket: $" + cost, width-16, 2*height/3-216); // y(spent)-24
}

public void dispSpent() {
    textAlign(RIGHT, CENTER);
    textSize(32);
    fill(255);
    text("SPENT", width - 16, 2*height/3-192);
    text("$"+spent, width-16, 2*height/3-160);
}

public void dispWinnings() {
    textAlign(RIGHT, CENTER);
    textSize(32);
    fill(255);
    text("WINNINGS", width-16, 2*height/3-96);
    fill(0, 255, 0);
    text("$"+winnings, width-16, 2*height/3-64);
}

public void dispNet() {
    textAlign(RIGHT, CENTER);
    textSize(32);
    fill(255);
    text("NET MONEY", width-16, 2*height/3);
    money = winnings - spent;
    String val = "";
    if (money > 0) {
        val += "+";
        fill(0, 255, 0);
    }
    else if (money < 0) {
        val += "-";
        fill(255, 0, 0);
    }
    else fill(255);

    val += "$";

    text(val+Math.abs(money), width-16, 2*height/3+32);
}

public void dispCommence() {
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255);

    if (modeHover == COMMENCE) fill(125);
    else fill(255);

    text("COMMENCE", 11*width/14, height-200);
}

public void dispStatsButton() {
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(32);
    if (modeHover == STATS) fill(125);
    else fill(255);
    text("STATISTICS", 11*width/14, 13*height/14);
}

public void dispReturn() {
    textAlign(CENTER, CENTER);
    textSize(32);
    if (modeHover == RETURN) fill(125);
    else fill(255);
    text("RETURN", 11*width/14, 13*height/14);
}

public void dispStats() {
    textAlign(LEFT, CENTER);
    fill(255);
    textSize(32);

    int x = 16;
    int y = 16;
    text("Number of tickets bought: " + ticketCount, x, y); y+=64;
    text("Outcome distribution", x, y);
    line(x+8, y+27, textWidth("Outcome distribution"), y+27); y+=64;
    text("No win: " + noWinCount, x, y); 
    dispPercentage(noWinCount, y); y+=64;
    int numTiers = 0;
    if (modeMem == POWERBALL) numTiers = 5;
    else if (modeMem == MEGAMIL) numTiers = 7;
    for (int i = 1; i <= numTiers; i++) {
        text("TIER" + i + " win: " + tierCountList.get(i), x, y);
        dispPercentage(tierCountList.get(i), y);
        y += 64;
    }
    text("JACKPOT win: " + jackpotCount, x, y);
    dispPercentage(jackpotCount, y); y+=64;
}

public void dispPercentage(int num, int y) {
    textAlign(RIGHT, CENTER);
    fill(255);
    textSize(32);
    double percentage = ((double)num / (double)ticketCount) * 100.0;
    text(percentage + "%", width-16, y);
    textAlign(LEFT, CENTER);
}

public void hoverTest() {
    if (mode == POWERBALL || mode == MEGAMIL) {
        if (mouseX > 689 && mouseX < 879 && mouseY > 790 && mouseY < 825) modeHover = COMMENCE;
        else if (scrollShift > 0 && mouseX > 542 && mouseX < 557 && mouseY > 5 && mouseY < 34) modeHover = ARROWTOP;
        else if (mouseX > 726 && mouseX < 848 && mouseY > 130 && mouseY < 161) modeHover = REROLL;
        else if (mouseX > 583 && mouseX < 637 && mouseY > 235 && mouseY < 265) modeHover = ON;
        else if (mouseX > 663 && mouseX < 729 && mouseY > 235 && mouseY < 265) modeHover = OFF;
        else if (mouseX > 693 && mouseY > 915 && mouseX < 873 && mouseY < 950) modeHover = STATS;
        else if (mouseX > 589 && mouseY > 364 && mouseX < 680 && mouseY < 397) modeHover = SPEED;
    }
    else if (mode == VIEWSTATS) {
        if (mouseX > 719 && mouseY > 916 && mouseX < 850 && mouseY < 952) modeHover = RETURN;
    }
}

public void mouseClicked() {
    speedFocus = false;
    if (mode == MENU) { // menu
        if (modeHover == POWERBALL) { // start powerball
            mode = POWERBALL;
            modeMem = POWERBALL;
            start();
            rollWinning();
            run();
        }
        else if (modeHover == MEGAMIL) { // start Mega Millions
            mode = MEGAMIL;
            modeMem = MEGAMIL;
            start();
            rollWinning();
            run();
        }
    }
    else if (mode == POWERBALL || mode == MEGAMIL) {
        if (modeHover == COMMENCE) commencing = !commencing;
        else if (modeHover == ARROWTOP) {
            scrollShift = 0;
            cursor(ARROW);
        }
        else if (modeHover == REROLL) reroll();
        else if (modeHover == ON) multiplying = true;
        else if (modeHover == OFF) multiplying = false;
        else if (modeHover == STATS) {
            mode = VIEWSTATS;
            modeHover = 0;
            draw();
        }
        else if (modeHover == SPEED) {
            speedFocus = true;
        }
    }
    else if (mode == VIEWSTATS) {
        if (modeHover == RETURN) mode = modeMem;
    }
}

// direction: -1 (up), 1 (down)
void scroll(int direction) {
    if (numsList.size() > 29) {
        scrollShift += 3 * direction;
        if (scrollShift < 0) scrollShift = 0;
        if (scrollShift > numsList.size()-28) scrollShift = numsList.size()-28;
    }
}

// Event doesn't fire when embeded in HTML
// public void mouseWheel(MouseEvent event) {
//     if (numsList.size() > 29) {
//         scrollShift -= 3 * event.getCount();
//         if (scrollShift < 0) scrollShift = 0;
//         if (scrollShift > numsList.size()-28) scrollShift = numsList.size()-28;
//     }
// }

// Quick sort reference:
// https://www.geeksforgeeks.org/quick-sort/

void sortInts(int[] arr) {
    quickSort(arr, 0, arr.length-1);
}

void swap(int[] arr, int i, int j) {
    int temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = low-1;
    for (int j = low; j <= high - 1; ++j) {
        if (arr[j] < pivot) {
            ++i;
            swap(arr, i, j);
        }
    }    
    swap(arr, i + 1, high);
    return (i + 1);
}

void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);

        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

// https://scanftree.com/programs/java/write-a-program-to-convert-string-to-number-without-using-integer-parseint-method/
int strToInt(String numStr) {
    char ch[] = numStr.toCharArray();
    int sum = 0;
    int zeroAscii = (int)'0';
    for (char c : ch) {
        int tmpAscii = (int)c;
        sum = (sum*10)+(tmpAscii-zeroAscii);
    }

    return sum;
}

public void debug() {
    //         System.out.println("modeHover: " + modeHover);   
    //         System.out.println("mode: " + mode);
    //         System.out.println("commencing: " + commencing);
    //         System.out.println("mouseX: " + mouseX);
    //         System.out.println("first: " + Arrays.toString(numsList.get(0)));
    //         System.out.println("yourY: " + yourY);
    //         System.out.println("scrollShift: " + scrollShift);
    //         System.out.println("multiplier: " + multiplier);
    //         System.out.println("multiplying: " + multiplying);
    //         System.out.println("speedFocus: " + speedFocus);
    //         System.out.println("blinking: " + Boolean.toString(millis() % 500 == 0));
    //         System.out.println("millis: " + millis());
    //         System.out.println("speedS: " + speedS);
    //         System.out.println(millis());
}
