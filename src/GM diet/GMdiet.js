import React, { useState } from "react";
import "./GMdiet.css"
import { BsArrowLeftRight } from "react-icons/bs";
import { BiSmile } from "react-icons/bi";
import { CgGym } from "react-icons/cg";
import Popup from "../biggestLoser/Popup";

export default function GMdiet(){
    const [buttonPopup, setButtonPopup] = useState(false);
    return(
    <div>
        <div className="introheading"><h1>General Motors diet</h1></div>
        <div className="intro">
        <p>&#8287;&#8287;&#8287;&#8287;&#8287;&#8287;&#8287;&#8287; GM diet is developed with help from the US Department of Agriculture and the FDA, with extensive testing at the Johns Hopkins Research Center.
        However, this claim has since been debunked as an urban myth, and the true origins of the GM diet remain unknown.</p>
        <p>The GM diet plan is broken up into seven days, each with strict rules about which food groups you can consume.</p>
        <p>The diet can supposedly help you:</p>
        <div className="introlist">
        <li>Lose up to 15 pounds (6.8 kg) in just one week.</li>
        <li>Get rid of toxins and impurities in your body.</li>
        <li>Improve your digestion.</li>
        <li>Enhance your body’s ability to burn fat.</li>
        <li> Proponents of the GM diet say it works because many of the foods included in the diet are low in calories, such as fruits and vegetables.</li>
        </div>
        <p>This can help promote weight loss by creating a calorie deficit, which is when you consume fewer calories than you burn throughout the day.</p>
        <p>The plan also states that many of the foods in the diet are “negative-calorie foods,” meaning they provide fewer calories than they take to digest.</p>
    </div>

        {/* Day 1 */}
        <div className="days">
            <div className="dayheader"><h2>Day 1</h2></div>
            <div className="daysideheading"><h3>Breakfast-8AM</h3></div>
            <div className="daytext"><p>A regular size apple with a glass of water.</p></div>
            <div className="daysideheading"><h3>Snacks-10AM</h3></div>
            <div className="daytext"><p>Half bowl of cantaloupes and a glass of water.</p></div>
            <div className="daysideheading"><h3>Lunch-1PM</h3></div>
            <div className="daytext"><p>A serving of watermelon and two glasses of water.</p></div>
            <div className="daysideheading"><h3>Snacks-4PM</h3></div>
            <div className="daytext"><p>A whole orange and a glass of water.</p></div>
            <div className="daysideheading"><h3>Dinner-7Pm</h3></div>
            <div className="daytext"><p>Sliced cantaloupe and a guava with two glasses of water.</p></div>
            <div  className="daysideAdditional"> <h2><BsArrowLeftRight/></h2> <span className="sidetext"><h3>Replacement</h3></span></div>
            <div className="daytext">
                
                    <li>Apple-Orange</li>
                    <li>Cantaloupe-Cucumber</li>
                    <li>watermelon-Honeydew melon or Cucumber</li>
                    <li>Orange-Grapefruit or Peach</li>
                    <li>Guava-Green apple</li>
                
            </div>
            <div  className="daysideAdditional"> <h2><CgGym/></h2> <span className="sidetext"><h3>Workout</h3></span></div>
            <div className="daytext">
                
                    <li>Arm Circles: 1 set of 10 reps</li>
                    <li>Wrist Rotations: 1 set of 10 reps</li>
                    <li>Shoulder Rotations: 1 set of 10 reps</li>
                    <li>Neck Rotations: 1 set of 10 reps</li>
                    <li>Ankle Rotations: 1 set of 10 reps</li>
                    <li>Leg Rotations: 1 set of 10 reps</li>
                    <li>Rope Jumping: 1 set of 50 reps</li>
                    <li>Squats: 2 sets of 5 reps</li>
                
            </div>
            <div  className="daysideAdditional"> <h2><BiSmile/></h2> <span className="sidetext"><h3>Feel Of the day</h3></span></div>
            <div className="daytext">
                
                <li>You might feel a little heahache. Its absolutely fine.</li>
                <li>if you have strictly followed the GM diet plan to lose weight in 7 days and exercises then you'll surely feel energetic, active and great!</li>
                
            </div>
        </div>

        {/* Day 2 */}
        <div className="days">
            <div className="dayheader"><h2>Day 2</h2></div>
            <div className="daysideheading"><h3>Breakfast-8AM</h3></div>
            <div className="daytext"><p>A boiled potato. You can also add a teaspoon of low-fat butter for flavor.</p></div>
            <div className="daysideheading"><h3>Snacks-10AM</h3></div>
            <div className="daytext"><p>Cabbage and lettuce salad with a light dressing and a glass of water.</p></div>
            <div className="daysideheading"><h3>Lunch-1PM</h3></div>
            <div className="daytext"><p>A mixed vegetable salad with cucumbers, onions, carrots and two glasses of water.</p></div>
            <div className="daysideheading"><h3>Snacks-4PM</h3></div>
            <div className="daytext"><p>A cup of boiled broccoli, half cup of sliced bell pepper and two glasses of water.</p></div>
            <div className="daysideheading"><h3>Dinner-7Pm</h3></div>
            <div className="daytext"><p>A Salad comprising boiled carrots, broccoli, green beans and two glasses of water.</p></div>
            <div  className="daysideAdditional"> <h2><BsArrowLeftRight/></h2> <span className="sidetext"><h3>Replacement</h3></span></div>
            <div className="daytext">
                
                    <li>Potato-Sweet potato or carrots</li>
                    <li>Butter-Margarine or sour cream</li>
                    <li>Lettuce-leek</li>
                    <li>Cabbage-Bok choy or celery</li>
                    <li>Cucumber-Carrots</li>
                    <li>Onion-Shallots</li>
                    <li>Carrot-Beetroot</li>
                    <li>Broccoli-Cauliflower</li>
                    <li>Bell pepper-Zucchini</li>
                    <li>Cauliflower-Green Beans</li>
                
            </div>
            <div  className="daysideAdditional"> <h2><CgGym/></h2> <span className="sidetext"><h3>Workout</h3></span></div>
            <div className="daytext">
                
                    <li>Arm Circles: 1 set of 10 reps</li>
                    <li>Wrist Rotations: 1 set of 10 reps</li>
                    <li>Shoulder Rotations: 1 set of 10 reps</li>
                    <li>Neck Rotations: 1 set of 10 reps</li>
                    <li>Ankle Rotations: 1 set of 10 reps</li>
                    <li>Leg Rotations: 1 set of 10 reps</li>
                    <li>Rope Jumping: 1 set of 50 reps</li>
                    <li>Squats: 2 sets of 5 reps</li>
                
            </div>
            <div  className="daysideAdditional"> <h2><BiSmile/></h2> <span className="sidetext"><h3>Feel Of the day</h3></span></div>
            <div className="daytext">
                
                <li>You might feel a little weak but not to worry. That is because of body is not getting usual carbohydrates.</li>
                
            </div>
        </div>

        {/* day 3 */}
        <div className="days">
            <div className="dayheader"><h2>Day 3</h2></div>
            <div className="daysideheading"><h3>Breakfast-8AM</h3></div>
            <div className="daytext"><p>Half bowl of cantaloupe or a sliced apple ans two glasses of water.</p></div>
            <div className="daysideheading"><h3>Snacks-10AM</h3></div>
            <div className="daytext"><p>Half sliced pineapple or a pear and two glasses of water.</p></div>
            <div className="daysideheading"><h3>Lunch-1PM</h3></div>
            <div className="daytext"><p>A salad of cucumber, carrot and lettuce with two glasses of water.</p></div>
            <div className="daysideheading"><h3>Snacks-4PM</h3></div>
            <div className="daytext"><p>An orange or a pear with half sliced cantaloupe and a glass of water.</p></div>
            <div className="daysideheading"><h3>Dinner-7Pm</h3></div>
            <div className="daytext"><p>Bolied broccoli and beets with two glasses of water.</p></div>
            <div  className="daysideAdditional"> <h2><BsArrowLeftRight/></h2> <span className="sidetext"><h3>Replacement</h3></span></div>
            <div className="daytext">
                
                    <li>Cantaloupe - Watermelon</li>
                    <li>Apple - Orange</li>
                    <li>Pear - Plum</li>
                    <li>pineapple - Peach</li>
                    <li>Cucumber - Kiwi</li>
                    <li>Lettuce - Chinese cabbage</li>
                    <li>Carrot - Bok choy or beetroot</li>
                    <li>Orange - Grapefruit or Kiwi</li>
                    <li>Broccoli - Cauliflower</li>
                    <li>Beetroot - Carrot</li>
               
            </div>
            <div  className="daysideAdditional"> <h2><CgGym/></h2> <span className="sidetext"><h3>Workout</h3></span></div>
            <div className="daytext">
                
                    <li>Arm Circles: 1 set of 10 reps</li>
                    <li>Wrist Rotations: 1 set of 10 reps</li>
                    <li>Shoulder Rotations: 1 set of 10 reps</li>
                    <li>Neck Rotations: 1 set of 10 reps</li>
                    <li>Ankle Rotations: 1 set of 10 reps</li>
                    <li>Leg Rotations: 1 set of 10 reps</li>
                    <li>Rope Jumping: 1 set of 50 reps</li>
                    <li>Squats: 2 sets of 5 reps</li>
                
            </div>
            <div  className="daysideAdditional"> <h2><BiSmile/></h2> <span className="sidetext"><h3>Feel Of the day</h3></span></div>
            <div className="daytext">
                
                <li>You might feel better again as you will get some sugar from fruits and crabs from vegetables.</li>
                <li>Exercising and staying active will also make you feel great.</li>
            </div>
        </div>

        {/* day4 */}
        <div className="days">
            <div className="dayheader"><h2>Day 4</h2></div>
            <div className="daysideheading"><h3>Breakfast-8AM</h3></div>
            <div className="daytext"><p>Two large bananas and a glass of milk later two glases of water.</p></div>
            <div className="daysideheading"><h3>Snacks-10AM</h3></div>
            <div className="daytext"><p>A banana shake (use one banana) and a glass of water. Half a teaspoon of honey can be added as a sweetener.</p></div>
            <div className="daysideheading"><h3>Lunch-1PM</h3></div>
            <div className="daytext"><div className="recipe"><p>A bowl of GM diet soup and two glasses of water.</p><div>
                <button className="button" onClick={() =>setButtonPopup(true)}>View recipe</button>
                <Popup trigger = {buttonPopup} setTrigger = {setButtonPopup}></Popup>
                </div></div></div>
            <div className="daysideheading"><h3>Snacks-4PM</h3></div>
            <div className="daytext"><p>A glass og banana milkshake and two glasses of water.</p></div>
            <div className="daysideheading"><h3>Dinner-7Pm</h3></div>
            <div className="daytext"><div className="recipe"><p>A bowl of GM diet soup and two glasses of water.</p> <div>
                <button className="button" onClick={() =>setButtonPopup(true)}>View recipe</button>
                <Popup trigger = {buttonPopup} setTrigger = {setButtonPopup}></Popup>
                </div></div>
            </div>
            <div  className="daysideAdditional"> <h2><BsArrowLeftRight/></h2> <span className="sidetext"><h3>Replacement</h3></span></div>
            <div className="daytext">
                
                    <li>Banana - Fig</li>
                    <li>Milk - Soy milk</li>

               
            </div>
            <div  className="daysideAdditional"> <h2><CgGym/></h2> <span className="sidetext"><h3>Workout</h3></span></div>
            <div className="daytext">
                
                    <li>Arm Circles: 1 set of 10 reps</li>
                    <li>Wrist Rotations: 1 set of 10 reps</li>
                    <li>Shoulder Rotations: 1 set of 10 reps</li>
                    <li>Neck Rotations: 1 set of 10 reps</li>
                    <li>Ankle Rotations: 1 set of 10 reps</li>
                    <li>Leg Rotations: 1 set of 10 reps</li>
                    <li>Rope Jumping: 1 set of 50 reps</li>
                    <li>Squats: 2 sets of 5 reps</li>
                
            </div>
            <div  className="daysideAdditional"> <h2><BiSmile/></h2> <span className="sidetext"><h3>Feel Of the day</h3></span></div>
            <div className="daytext">
                
                <li>You might feel demotivated eating milk and bananas.</li>
                <li>Exercising and drinking water will make you lose weight.</li>
                
            </div>
        </div>

        {/* day 5 */}
        <div className="days">
            <div className="dayheader"><h2>Day 5</h2></div>
            <div className="daysideheading"><h3>Breakfast-8AM</h3></div>
            <div className="daytext"><p>A few small tomatoes with a bowl of boiled, seasoned kidney beans and two glasses of water.</p></div>
            <div className="daysideheading"><h3>Snacks-10AM</h3></div>
            <div className="daytext"><p>A cup of yogurt and two glasses of water.</p></div>
            <div className="daysideheading"><h3>Lunch-1PM</h3></div>
            <div className="daytext"><p>A bowl of cooked brown rice with two tomatoes and two glasses of water.</p></div>
            <div className="daysideheading"><h3>Snacks-4PM</h3></div>
            <div className="daytext"><p>A salad with onions and sptouts or bowl baked or salted of tomatoes with two glasses of water.</p></div>
            <div className="daysideheading"><h3>Dinner-7Pm</h3></div>
            <div className="daytext"><div className="recipe"><p>GM diet soup with two glasses of water.</p> <div>
                <button className="button" onClick={() =>setButtonPopup(true)}>View recipe</button>
                <Popup trigger = {buttonPopup} setTrigger = {setButtonPopup}></Popup>
                </div></div>
            </div>
            <div  className="daysideAdditional"> <h2><BsArrowLeftRight/></h2> <span className="sidetext"><h3>Replacement</h3></span></div>
            <div className="daytext">
                
                    <li>Tomato - Carrot</li>
                    <li>Kidney beans - Black eyed peas</li>
                    <li>Yogurt - Sour cream</li>
                    <li>Brown rice - Quinoa</li>
                    <li>Onion - Cucumber</li>
                    <li>Sprouts - Soaked Bengal gram</li>
                    <li>Apple - Kiwi</li>
                    <li>Pear - Orange</li>
                                  
            </div>
            <div  className="daysideAdditional"> <h2><CgGym/></h2> <span className="sidetext"><h3>Workout</h3></span></div>
            <div className="daytext">
                
                    <li>Arm Circles: 1 set of 10 reps</li>
                    <li>Wrist Rotations: 1 set of 10 reps</li>
                    <li>Shoulder Rotations: 1 set of 10 reps</li>
                    <li>Neck Rotations: 1 set of 10 reps</li>
                    <li>Ankle Rotations: 1 set of 10 reps</li>
                    <li>Leg Rotations: 1 set of 10 reps</li>
                    <li>Rope Jumping: 1 set of 50 reps</li>
                    <li>Squats: 2 sets of 5 reps</li>
                
            </div>
            <div  className="daysideAdditional"> <h2><BiSmile/></h2> <span className="sidetext"><h3>Feel Of the day</h3></span></div>
            <div className="daytext">
                
                <li>You will feel enthusiastic.</li>
                <li>Protien, crabs and fruits will elevate your mood.</li>
                
            </div>
        </div>

        {/* day 6 */}
        <div className="days">
            <div className="dayheader"><h2>Day 6</h2></div>
            <div className="daysideheading"><h3>Breakfast-8AM</h3></div>
            <div className="daytext"><div className="recipe"><p>A bowl of GM diet soup and two glasses of water.</p> <div>
                <button className="button" onClick={() =>setButtonPopup(true)}>View recipe</button>
                <Popup trigger = {buttonPopup} setTrigger = {setButtonPopup}></Popup>
                </div></div>
            </div>
            <div className="daysideheading"><h3>Snacks-10AM</h3></div>
            <div className="daytext"><p>A bowl of mixed boiled vegetables or kidney beans and two glasses of water.</p></div>
            <div className="daysideheading"><h3>Lunch-1PM</h3></div>
            <div className="daytext"><p>A bowl of brown rice and vegetables and two glasses of water.</p></div>
            <div className="daysideheading"><h3>Snacks-4PM</h3></div>
            <div className="daytext"><p>3-4 baby carrots and a glass of water.</p></div>
            <div className="daysideheading"><h3>Dinner-7Pm</h3></div>
            <div className="daytext"><div className="recipe"><p>A bowl of boiled vegetables or GM diet soup with two glasses of water. </p> <div>
                <button className="button" onClick={() =>setButtonPopup(true)}>View recipe</button>
                <Popup trigger = {buttonPopup} setTrigger = {setButtonPopup}></Popup>
                </div></div>
                </div>
            <div  className="daysideAdditional"> <h2><BsArrowLeftRight/></h2> <span className="sidetext"><h3>Replacement</h3></span></div>
            <div className="daytext">
                
                    <li>Bolied kidney beans - Boiled Bengal gram</li>
                    <li>Tomatoes - Cucumber</li>
                    <li>Brown rice - Quinoa</li>
                    <li>Carrot - Beetroot or Cucumber</li>
                    
               
            </div>
            <div  className="daysideAdditional"> <h2><CgGym/></h2> <span className="sidetext"><h3>Workout</h3></span></div>
            <div className="daytext">
                
                    <li>Arm Circles: 1 set of 10 reps</li>
                    <li>Wrist Rotations: 1 set of 10 reps</li>
                    <li>Shoulder Rotations: 1 set of 10 reps</li>
                    <li>Neck Rotations: 1 set of 10 reps</li>
                    <li>Ankle Rotations: 1 set of 10 reps</li>
                    <li>Leg Rotations: 1 set of 10 reps</li>
                    <li>Rope Jumping: 1 set of 50 reps</li>
                    <li>Squats: 2 sets of 5 reps</li>
                
            </div>
            <div  className="daysideAdditional"> <h2><BiSmile/></h2> <span className="sidetext"><h3>Feel Of the day</h3></span></div>
            <div className="daytext">
                
                <li>You will start feeling lighter and will notice a prominently slimmer today.</li>
                
            </div>
        </div>

        {/* day 7 */}
        <div className="days">
            <div className="dayheader"><h2>Day 7</h2></div>
            <div className="daysideheading"><h3>Breakfast-8AM</h3></div>
            <div className="daytext"><p>A cup of brown rice with melon or some mixed vegetables and two glasses of water.</p></div>
            <div className="daysideheading"><h3>Snacks-10AM</h3></div>
            <div className="daytext"><p>Mixed fruit juice without sugar and two glasses of water.</p></div>
            <div className="daysideheading"><h3>Lunch-1PM</h3></div>
            <div className="daytext"><p>A wholesome big salad with favourite vegetables with a raw mango and two glasses of water.</p></div>
            <div className="daysideheading"><h3>Snacks-4PM</h3></div>
            <div className="daytext"><p>Mixed fruit juice without sugar and two glasses of water.</p></div>
            <div className="daysideheading"><h3>Dinner-7Pm</h3></div>
            <div className="daytext"><p>A bowl of brown rice with a lot of vegetables of choice and two glasses of water.</p></div>
            <div  className="daysideAdditional"> <h2><BsArrowLeftRight/></h2> <span className="sidetext"><h3>Replacement</h3></span></div>
            <div className="daytext">
                
                    <li>Tomatoes - Cucumber</li>
                    <li>Brown Rice - Quinoa</li>
                    <li>Carrot - Beetroot or Cucumber</li>
                    
                    
               
            </div>
            <div  className="daysideAdditional"> <h2><CgGym/></h2> <span className="sidetext"><h3>Workout</h3></span></div>
            <div className="daytext">
                
                    <li>Arm Circles: 1 set of 10 reps</li>
                    <li>Wrist Rotations: 1 set of 10 reps</li>
                    <li>Shoulder Rotations: 1 set of 10 reps</li>
                    <li>Neck Rotations: 1 set of 10 reps</li>
                    <li>Ankle Rotations: 1 set of 10 reps</li>
                    <li>Leg Rotations: 1 set of 10 reps</li>
                    <li>Rope Jumping: 1 set of 50 reps</li>
                    <li>Squats: 2 sets of 5 reps</li>
                
            </div>
            <div  className="daysideAdditional"> <h2><BiSmile/></h2> <span className="sidetext"><h3>Feel Of the day</h3></span></div>
            <div className="daytext">
                
                <li>You will feel to eat potato or high-calorie dessert but don't fall for it.</li>
                <li>The exercise routine will keep you look slim and trim and help you stay active throughout the day.</li>

            </div>
        </div>

    </div>
)
}
