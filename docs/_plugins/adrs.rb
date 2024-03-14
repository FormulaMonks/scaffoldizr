module Reading
    class Generator < Jekyll::Generator
        def generate(site)
            adrs_dir = File.join(Dir.pwd, "../architecture/decisions")
            Dir.each_child(adrs_dir) do |filename|
                puts "Found ADR: #{filename}"
                dest_path = File.join(Dir.pwd, "_adrs", filename)
                if File.file?(dest_path)
                    puts "Ignoring ADR: #{filename}"
                    next
                else
                    puts "Adding ADR: #{filename}"
                    content = File.read(File.join(adrs_dir, filename))
                    File.write(dest_path, "---\nname: #{filename.gsub('.md', '')}\nlayout: default\n---\n\n#{content}")
                end
            end
        end
    end
end