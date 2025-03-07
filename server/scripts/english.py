import sys
import pyttsx3

args = sys.argv
engine = pyttsx3.init()                                 # object creation

# Speed
rate = engine.getProperty('rate')                       # getting details of current speaking rate
engine.setProperty('rate', 160)                         # setting up new voice rate

# Volume
volume = engine.getProperty('volume')                   # getting to know current volume level (min=0 and max=1)
engine.setProperty('volume',1.0)                        # setting up volume level  between 0 and 1

# Voice
voices = engine.getProperty('voices')                   # getting details of current voice
engine.setProperty('voice', voices[int(args[2])].id)    # changing index, changes voices. o for male

engine.save_to_file(args[1], args[3])
engine.runAndWait()

print("Success! " + args[3])
