module ADRs
    class Generator < Jekyll::Generator
        def generate(site)
            adrs_dir = File.join(Dir.pwd, "../architecture/decisions")

            Dir.each_child(adrs_dir) do |filename|
                puts "Found ADR: #{filename}"
                dest_path = File.join(Dir.pwd, "_adrs", filename)

                puts "Adding ADR: #{filename}"
                content = File.read(File.join(adrs_dir, filename))
                File.write(dest_path, "---\nname: #{filename.gsub('.md', '')}\nlayout: default\n---\n\n[< Back]({% if site.baseurl %}{{ site.baseurl }}{% else %}/adrs/{% endif %})\n\n#{content}")

                adr = Jekyll::Document.new(
                    dest_path,
                    {
                        :site => site,
                        :collection => site.collections["adrs"]
                    }
                )

                adr.read

                site.collections["adrs"].docs << adr
                adr.write(site.dest)
            end
        end
    end
end