for f in *.mp3; do 
  codec=$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 "$f"); 
  if [ "$codec" != "mp3" ]; then 
    echo "❌ $f -> $codec"; 
  fi; 
done